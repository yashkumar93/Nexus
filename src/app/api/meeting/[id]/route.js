import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import admin from '@/lib/firebase-admin';
import supabase from '@/lib/supabase';
import store from '@/lib/memory-store';

async function getUser(request) {
  let user = authMiddleware(request);
  if (!user) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        let role = 'member';
        let teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef'];
        if (
          decodedToken.email &&
          (decodedToken.email.startsWith('priya@') ||
            decodedToken.email.includes('admin') ||
            decodedToken.email === 'patel.priya@gmail.com')
        ) {
          role = 'org_admin';
          teamIds = [
            'e0c6600c-b26a-4d7a-8f12-0fbc185906ef',
            'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c',
          ];
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
        console.warn('[meeting detail api] Firebase verification failed:', e.message);
      }
    }
  }
  return user;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Try Supabase
    try {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (!meetingError && meeting) {
        const { data: transcripts, error: transcriptError } = await supabase
          .from('transcript_segments')
          .select('*')
          .eq('meeting_id', id)
          .order('start_ts', { ascending: true });

        if (transcriptError) throw transcriptError;

        return NextResponse.json({
          id: meeting.id,
          title: meeting.title,
          status: meeting.status,
          summary: meeting.summary,
          date: meeting.started_at
            ? new Date(meeting.started_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          transcript: (transcripts || []).map((t) => ({
            id: t.id,
            speaker: t.speaker_name || t.speaker || 'Unknown',
            speakerId: t.speaker_user_id || t.speakerId || null,
            text: t.text,
            start: t.start_ts,
            end: t.end_ts,
            capturedAt: t.created_at || t.capturedAt,
          })),
        });
      }
    } catch (dbErr) {
      console.warn(
        '[meeting detail api] Supabase get failed, falling back to memory store:',
        dbErr.message,
      );
    }

    // 2. Fall back to memory store
    const meeting = store.getMeeting(id);
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const transcripts = store.getTranscripts(id);

    return NextResponse.json({
      id: meeting.id,
      title: meeting.title,
      status: meeting.status,
      summary: meeting.summary,
      date: meeting.started_at
        ? new Date(meeting.started_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      transcript: transcripts.map((t) => ({
        id: t.id,
        speaker: t.speaker,
        speakerId: t.speakerId,
        text: t.text,
        start: t.start,
        end: t.end,
        capturedAt: t.capturedAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (body.status !== 'ended') {
      return NextResponse.json(
        { error: 'Only ending a meeting is supported' },
        { status: 400 },
      );
    }

    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('meetings')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        store.endMeeting(id); // keep memory-store in sync
        return NextResponse.json({
          id,
          status: 'ended',
          endedAt: data.ended_at,
          persisted: true,
        });
      }
    } catch (dbErr) {
      console.warn(
        '[meeting detail api] Supabase update failed, falling back to memory store:',
        dbErr.message,
      );
    }

    // 2. Fall back to memory store
    const success = store.endMeeting(id);
    if (!success) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = store.getMeeting(id);
    return NextResponse.json({
      id,
      status: 'ended',
      endedAt: meeting.ended_at,
      persisted: false,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Try Supabase (cascade deletes transcript_segments if FK is set)
    try {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
    } catch (dbErr) {
      console.warn(
        '[meeting detail api] Supabase delete failed, continuing to memory store:',
        dbErr.message,
      );
    }

    // 2. Clear memory store cache
    store.deleteMeeting(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
