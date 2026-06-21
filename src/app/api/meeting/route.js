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
        console.warn('[meeting api] Firebase verification failed:', e.message);
      }
    }
  }
  return user;
}

export async function GET(request) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamIds = user.teamIds || [];
    if (teamIds.length === 0) {
      return NextResponse.json([]);
    }

    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          status,
          summary,
          started_at,
          ended_at,
          platform,
          meeting_participants(count)
        `)
        .in('team_id', teamIds)
        .order('started_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const meetings = data.map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          summary: row.summary,
          date: row.started_at
            ? new Date(row.started_at).toISOString().split('T')[0]
            : null,
          participants: row.meeting_participants?.[0]?.count || 1,
        }));
        return NextResponse.json(meetings);
      }
    } catch (dbErr) {
      console.warn(
        '[meeting api] Supabase query failed, falling back to memory store:',
        dbErr.message,
      );
    }

    // 2. Fall back to memory store
    const meetings = store.getMeetings();
    return NextResponse.json(meetings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, teamId } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const meetingId = crypto.randomUUID();
    const useTeamId =
      teamId ||
      user.teamIds?.[0] ||
      'e0c6600c-b26a-4d7a-8f12-0fbc185906ef';
    const orgId = user.orgId || 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0';

    // 1. Try Supabase
    try {
      // Ensure org and team rows exist
      await supabase
        .from('organizations')
        .upsert({ id: orgId, name: 'Nexus Labs' }, { onConflict: 'id', ignoreDuplicates: true });

      await supabase
        .from('teams')
        .upsert(
          { id: useTeamId, org_id: orgId, name: 'Engineering' },
          { onConflict: 'id', ignoreDuplicates: true },
        );

      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          id: meetingId,
          team_id: useTeamId,
          title,
          started_at: new Date().toISOString(),
          platform: 'manual',
          status: 'live',
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Add creator as participant (ignore duplicate errors)
      await supabase.from('meeting_participants').upsert(
        {
          meeting_id: meetingId,
          user_id: user.userId,
          joined_at: new Date().toISOString(),
        },
        { onConflict: 'meeting_id,user_id', ignoreDuplicates: true },
      );

      return NextResponse.json({
        id: meetingData.id,
        title: meetingData.title,
        date: new Date(meetingData.started_at).toISOString().split('T')[0],
        participants: 1,
        status: meetingData.status,
        summary: null,
      });
    } catch (dbErr) {
      console.warn(
        '[meeting api] Supabase create failed, falling back to memory store:',
        dbErr.message,
      );
    }

    // 2. Fall back to memory store
    const meeting = store.createMeeting({
      id: meetingId,
      title,
      teamId: useTeamId,
    });

    return NextResponse.json({
      id: meeting.id,
      title: meeting.title,
      date: new Date(meeting.started_at).toISOString().split('T')[0],
      participants: 1,
      status: meeting.status,
      summary: null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
