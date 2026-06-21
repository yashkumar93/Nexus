import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import admin from '@/lib/firebase-admin';
import supabase from '@/lib/supabase';
import store from '@/lib/memory-store';
import { transcribeAudio } from '@/lib/ai/transcription';


export const runtime = 'nodejs';

// Lazy-load AI pipeline functions
let extractEntities = null;
let retrieveContext = null;
let detectContradictions = null;
let upsertTranscriptSegment = null;

async function storeAudioChunk(buffer, audioFile, meetingId, chunkStart, chunkEnd) {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName || !admin.apps.length) return null;

  try {
    const extension = audioFile.name?.split('.').pop() || 'webm';
    const objectName = [
      'meeting-recordings',
      meetingId,
      `${String(Math.round(chunkStart * 1000)).padStart(12, '0')}-${crypto.randomUUID()}.${extension}`,
    ].join('/');

    await admin.storage().bucket(bucketName).file(objectName).save(buffer, {
      resumable: false,
      contentType: audioFile.type || 'audio/webm',
      metadata: {
        metadata: {
          meetingId,
          chunkStart: String(chunkStart),
          chunkEnd: String(chunkEnd),
        },
      },
    });

    return objectName;
  } catch (storageError) {
    console.warn('[transcribe api] Failed to retain audio chunk:', storageError.message);
    return null;
  }
}

async function loadPipeline() {
  if (!extractEntities) {
    const mod = await import('@/lib/ai/extractor');
    extractEntities = mod.extractEntities;
  }
  if (!retrieveContext) {
    const mod = await import('@/lib/ai/retriever');
    retrieveContext = mod.retrieveContext;
  }
  if (!detectContradictions) {
    const mod = await import('@/lib/ai/contradiction');
    detectContradictions = mod.detectContradictions;
  }
  if (!upsertTranscriptSegment) {
    const mod = await import('@/lib/ai/pinecone');
    upsertTranscriptSegment = mod.upsertTranscriptSegment;
  }
}

export async function POST(request) {
  try {
    // 1. Authenticate user
    let user = authMiddleware(request);
    if (!user) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          let role = 'member';
          let teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef'];
          if (decodedToken.email && (decodedToken.email.startsWith('priya@') || decodedToken.email.includes('admin') || decodedToken.email === 'patel.priya@gmail.com')) {
            role = 'org_admin';
            teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'];
          }
          user = {
            userId: decodedToken.uid,
            orgId: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
            teamIds,
            role,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email.split('@')[0],
          };
        } catch (e) {
          console.warn('[transcribe api] Firebase Token verification failed:', e.message);
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const meetingId = formData.get('meetingId');
    const chunkStart = Number(formData.get('chunkStart') || 0);
    const chunkEnd = Number(formData.get('chunkEnd') || chunkStart);
    const sourceLabel = String(formData.get('sourceLabel') || 'Meeting audio').slice(0, 255);

    if (!audioFile || !meetingId) {
      return NextResponse.json({ error: 'Missing audio file or meetingId' }, { status: 400 });
    }
    if (audioFile.size === 0) {
      return NextResponse.json({ error: 'The audio upload was empty' }, { status: 400 });
    }
    if (!Number.isFinite(chunkStart) || !Number.isFinite(chunkEnd)) {
      return NextResponse.json({ error: 'Invalid audio chunk timestamps' }, { status: 400 });
    }

    // Convert file to Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // 3. Retain the recording chunk and transcribe it in parallel.
    const [audioObject, result] = await Promise.all([
      storeAudioChunk(buffer, audioFile, meetingId, chunkStart, chunkEnd),
      transcribeAudio(buffer, {
        language: 'en',
        fileName: audioFile.name,
        mimeType: audioFile.type,
        prompt: 'Accurately transcribe this business meeting. Preserve names, technical terms, numbers, decisions, and action items.',
      }),
    ]);
    const text = result.text.trim();

    if (!text) {
      return NextResponse.json({ text: '', segments: [] });
    }

    const relativeSegments = result.segments.length
      ? result.segments
      : [{ start: 0, end: Math.max(0, chunkEnd - chunkStart), text }];
    const transcriptSegments = relativeSegments.map((segment) => ({
      id: crypto.randomUUID(),
      speaker: sourceLabel,
      speakerId: user.userId,
      text: segment.text,
      start: Math.max(0, chunkStart + segment.start),
      end: Math.max(chunkStart + segment.start, chunkStart + segment.end),
      capturedAt: new Date().toISOString(),
      meetingId,
    }));

    // 4. Save timestamped segments to Supabase with memory-store fallback.
    for (const segment of transcriptSegments) {
      try {
        const { error: insertError } = await supabase
          .from('transcript_segments')
          .insert({
            id: segment.id,
            meeting_id: segment.meetingId,
            speaker_user_id: segment.speakerId,
            speaker_name: segment.speaker,
            text: segment.text,
            start_ts: segment.start,
            end_ts: segment.end,
          });
        if (insertError) throw insertError;
      } catch (dbErr) {
        console.warn('[transcribe api] Failed to store segment in Supabase, falling back to memory store:', dbErr.message);
        store.addTranscript(segment);
      }
    }

    // 5. Emit to Socket room
    const roomKey = `meeting:${meetingId}`;
    if (global.io) {
      for (const segment of transcriptSegments) {
        global.io.to(roomKey).emit('transcript:chunk', segment);
      }

      // Run AI pipeline in the background
      (async () => {
        try {
          await loadPipeline();

          // A. Entity Extraction
          if (extractEntities) {
            try {
              const entities = await extractEntities(text, {
                meetingId,
                speaker: sourceLabel,
                timestamp: transcriptSegments[0].start,
              });
              if (entities && entities.length > 0) {
                global.io.to(roomKey).emit('entities:extracted', {
                  chunkId: transcriptSegments[0].id,
                  entities,
                });
              }
            } catch (err) {
              console.error('[transcribe api] Entity extraction failed:', err.message);
            }
          }

          // B. Context Retrieval
          if (retrieveContext) {
            try {
              const contextCards = await retrieveContext(text, {
                meetingId,
                orgId: user.orgId,
                teamIds: user.teamIds,
              });
              if (contextCards && contextCards.length > 0) {
                for (const card of contextCards) {
                  global.io.to(roomKey).emit('context:card', {
                    ...card,
                    chunkId: transcriptSegments[0].id,
                  });
                }
              }
            } catch (err) {
              console.error('[transcribe api] Context retrieval failed:', err.message);
            }
          }

          // C. Contradiction Detection
          if (detectContradictions) {
            try {
              const contradictions = await detectContradictions(text, {
                meetingId,
                orgId: user.orgId,
                teamIds: user.teamIds,
                speaker: user.name,
              });
              if (contradictions && contradictions.length > 0) {
                for (const contradiction of contradictions) {
                  global.io.to(roomKey).emit('contradiction:card', {
                    ...contradiction,
                    chunkId: transcriptSegments[0].id,
                  });
                }
              }
            } catch (err) {
              console.error('[transcribe api] Contradiction detection failed:', err.message);
            }
          }

          // D. Pinecone Vector Search Indexing
          if (upsertTranscriptSegment) {
            try {
              let meetingTitle = 'Meeting';
              try {
                const { data: mData } = await supabase
                  .from('meetings')
                  .select('title')
                  .eq('id', meetingId)
                  .single();
                if (mData?.title) meetingTitle = mData.title;
              } catch (dbErr) {
                const meeting = store.getMeeting(meetingId);
                meetingTitle = meeting?.title || 'Meeting';
              }
              const teamId = user.teamIds?.[0] || 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef';
              for (const segment of transcriptSegments) {
                await upsertTranscriptSegment(segment, teamId, meetingTitle);
              }
            } catch (err) {
              console.error('[transcribe api] Pinecone indexing failed:', err.message);
            }
          }
        } catch (pipelineErr) {
          console.error('[transcribe api] AI Pipeline load failed:', pipelineErr.message);
        }
      })();
    }

    return NextResponse.json({
      text,
      segments: transcriptSegments,
      audioObject,
    });
  } catch (err) {
    console.error('[transcribe api] Error in route:', err);
    return NextResponse.json(
      { error: err.message || 'Audio transcription failed' },
      { status: 500 }
    );
  }
}
