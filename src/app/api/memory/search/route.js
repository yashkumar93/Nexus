import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import admin from '@/lib/firebase-admin';
import { queryMemory } from '@/lib/ai/query';

export const runtime = 'nodejs';

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
        console.warn('[search api] Firebase token verification failed:', e.message);
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

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const result = await queryMemory(q, {
      teamIds: user.teamIds,
      orgId: user.orgId,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[search api] Error processing memory search:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to search organizational memory' },
      { status: 500 }
    );
  }
}
