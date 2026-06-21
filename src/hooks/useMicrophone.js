'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TRANSCRIPTION_CHUNK_MS = 10_000;

function getSupportedMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function extensionForMimeType(mimeType) {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'm4a';
  return 'webm';
}

function stopTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

/**
 * Capture meeting audio and create independently decodable chunks for
 * transcription while retaining a continuous local recording.
 */
export function useMicrophone(meetingId, onTranscriptChunk) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);

  const recordingUrlRef = useRef(null);
  const onTranscriptChunkRef = useRef(onTranscriptChunk);
  const activeRef = useRef(false);
  const transcriptionRecorderRef = useRef(null);
  const archiveRecorderRef = useRef(null);
  const archiveChunksRef = useRef([]);
  const sourceStreamsRef = useRef([]);
  const captureStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const chunkTimerRef = useRef(null);
  const sessionStartedAtRef = useRef(0);
  const accumulatedMsRef = useRef(0);
  const chunkStartSecondsRef = useRef(0);
  const uploadQueueRef = useRef(Promise.resolve());
  const pendingUploadsRef = useRef(0);
  const recordingStoppedPromiseRef = useRef(Promise.resolve());
  const resolveRecordingStoppedRef = useRef(null);
  const stopRecordingRef = useRef(() => {});
  const startTranscriptionChunkRef = useRef(() => {});
  const sourceLabelRef = useRef('Meeting audio');

  useEffect(() => {
    onTranscriptChunkRef.current = onTranscriptChunk;
  }, [onTranscriptChunk]);

  const sendAudioChunk = useCallback(async (blob, startSeconds, endSeconds, sourceLabel) => {
    if (!blob || blob.size === 0) return;

    const formData = new FormData();
    const mimeType = blob.type || 'audio/webm';
    formData.append('audio', blob, `audio.${extensionForMimeType(mimeType)}`);
    formData.append('meetingId', meetingId);
    formData.append('chunkStart', String(startSeconds));
    formData.append('chunkEnd', String(endSeconds));
    formData.append('sourceLabel', sourceLabel);

    const token = localStorage.getItem('nexus_access_token');
    const response = await fetch('/api/meeting/transcribe', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Transcription upload failed (${response.status})`);
    }

    if (data.segments?.length) {
      onTranscriptChunkRef.current?.(data);
    }
  }, [meetingId]);

  const queueAudioChunk = useCallback((blob, startSeconds, endSeconds, sourceLabel) => {
    pendingUploadsRef.current += 1;
    setIsUploading(true);
    uploadQueueRef.current = uploadQueueRef.current
      .then(() => sendAudioChunk(blob, startSeconds, endSeconds, sourceLabel))
      .catch((uploadError) => {
        console.error('[useMicrophone] Transcription failed:', uploadError);
        setError(uploadError.message);
      })
      .finally(() => {
        pendingUploadsRef.current -= 1;
        if (pendingUploadsRef.current === 0) setIsUploading(false);
      });
    return uploadQueueRef.current;
  }, [sendAudioChunk]);

  const startTranscriptionChunk = useCallback((mimeType) => {
    if (!activeRef.current || !captureStreamRef.current) return;

    const recorder = new MediaRecorder(
      captureStreamRef.current,
      mimeType ? { mimeType, audioBitsPerSecond: 128_000 } : undefined
    );
    const chunks = [];
    const chunkSourceLabel = sourceLabelRef.current;
    const timelineOffsetMs = accumulatedMsRef.current;
    const recordingSessionStartedAt = sessionStartedAtRef.current;
    const chunkStart = timelineOffsetMs / 1000
      + (performance.now() - recordingSessionStartedAt) / 1000;

    chunkStartSecondsRef.current = chunkStart;
    transcriptionRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const captureEndedAt = recorder.captureEndedAt || performance.now();
      const chunkEnd = timelineOffsetMs / 1000
        + Math.max(0, captureEndedAt - recordingSessionStartedAt) / 1000;
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });
      const uploadPromise = queueAudioChunk(
        blob,
        chunkStartSecondsRef.current,
        Math.max(chunkStartSecondsRef.current, chunkEnd),
        chunkSourceLabel
      );

      if (activeRef.current) {
        startTranscriptionChunkRef.current(mimeType);
      } else {
        uploadPromise.finally(() => {
          resolveRecordingStoppedRef.current?.();
          resolveRecordingStoppedRef.current = null;
        });
      }
    };

    recorder.start();
    chunkTimerRef.current = window.setTimeout(() => {
      if (recorder.state === 'recording') {
        recorder.captureEndedAt = performance.now();
        recorder.stop();
      }
    }, TRANSCRIPTION_CHUNK_MS);
  }, [queueAudioChunk]);

  useEffect(() => {
    startTranscriptionChunkRef.current = startTranscriptionChunk;
  }, [startTranscriptionChunk]);

  const createCaptureStream = useCallback(async (captureMode) => {
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    sourceStreamsRef.current.push(micStream);

    if (captureMode === 'microphone') {
      return micStream;
    }

    let displayStream;
    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        preferCurrentTab: false,
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        systemAudio: 'include',
      });
    } catch (displayError) {
      stopTracks(micStream);
      sourceStreamsRef.current = [];
      throw displayError;
    }

    sourceStreamsRef.current.push(displayStream);
    if (displayStream.getAudioTracks().length === 0) {
      sourceStreamsRef.current.forEach(stopTracks);
      sourceStreamsRef.current = [];
      throw new Error('No meeting audio was shared. Select a browser tab or window and enable “Share audio”.');
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    audioContext.createMediaStreamSource(displayStream).connect(destination);
    audioContext.createMediaStreamSource(micStream).connect(destination);
    audioContextRef.current = audioContext;

    displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
      if (activeRef.current) stopRecordingRef.current();
    }, { once: true });

    return destination.stream;
  }, []);

  const startRecording = useCallback(async (captureMode = 'meeting') => {
    if (activeRef.current) return;
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      if (recordingUrlRef.current) {
        URL.revokeObjectURL(recordingUrlRef.current);
        recordingUrlRef.current = null;
        setRecordingUrl(null);
      }

      const stream = await createCaptureStream(captureMode);
      const mimeType = getSupportedMimeType();
      sourceLabelRef.current = captureMode === 'microphone' ? 'Microphone' : 'Meeting audio';
      captureStreamRef.current = stream;
      archiveChunksRef.current = [];
      activeRef.current = true;
      recordingStoppedPromiseRef.current = new Promise((resolve) => {
        resolveRecordingStoppedRef.current = resolve;
      });
      sessionStartedAtRef.current = performance.now();

      const archiveRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, audioBitsPerSecond: 128_000 } : undefined
      );
      archiveRecorderRef.current = archiveRecorder;
      archiveRecorder.ondataavailable = (event) => {
        if (event.data?.size) archiveChunksRef.current.push(event.data);
      };
      archiveRecorder.onstop = () => {
        if (!archiveChunksRef.current.length) return;
        const blob = new Blob(archiveChunksRef.current, {
          type: archiveRecorder.mimeType || mimeType || 'audio/webm',
        });
        const nextRecordingUrl = URL.createObjectURL(blob);
        recordingUrlRef.current = nextRecordingUrl;
        setRecordingUrl(nextRecordingUrl);
      };
      archiveRecorder.start(1000);

      startTranscriptionChunk(mimeType);
      setIsRecording(true);
    } catch (captureError) {
      console.error('[useMicrophone] Failed to start capture:', captureError);
      setError(
        captureError.name === 'NotAllowedError'
          ? 'Recording permission was denied.'
          : captureError.message || 'Unable to start recording.'
      );
      activeRef.current = false;
      setIsRecording(false);
    }
  }, [createCaptureStream, startTranscriptionChunk]);

  const stopRecording = useCallback(() => {
    if (!activeRef.current) return recordingStoppedPromiseRef.current;

    activeRef.current = false;
    setIsRecording(false);
    window.clearTimeout(chunkTimerRef.current);

    const sessionDuration = Math.max(0, performance.now() - sessionStartedAtRef.current);
    accumulatedMsRef.current += sessionDuration;
    sessionStartedAtRef.current = performance.now();

    if (transcriptionRecorderRef.current?.state === 'recording') {
      transcriptionRecorderRef.current.captureEndedAt = performance.now();
      transcriptionRecorderRef.current.stop();
    } else {
      uploadQueueRef.current.finally(() => {
        resolveRecordingStoppedRef.current?.();
        resolveRecordingStoppedRef.current = null;
      });
    }
    if (archiveRecorderRef.current?.state === 'recording') {
      archiveRecorderRef.current.stop();
    }

    sourceStreamsRef.current.forEach(stopTracks);
    sourceStreamsRef.current = [];
    stopTracks(captureStreamRef.current);
    captureStreamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    return recordingStoppedPromiseRef.current;
  }, []);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => () => {
    stopRecordingRef.current();
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
  }, []);

  return {
    isRecording,
    isUploading,
    startRecording,
    stopRecording,
    error,
    recordingUrl,
  };
}

export default useMicrophone;
