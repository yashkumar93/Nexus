import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, createTokens } from '@/lib/auth';
import { findUserByEmail } from '@/lib/auth-store';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user = null;

    // 1. Try PostgreSQL
    try {
      const result = await query(
        `SELECT u.*, COALESCE(ARRAY(SELECT team_id::text FROM user_teams WHERE user_id = u.id), ARRAY[]::text[]) as team_ids 
         FROM users u 
         WHERE u.email = $1`,
        [email]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        user = {
          id: row.id,
          org_id: row.org_id,
          name: row.name,
          email: row.email,
          password_hash: row.password_hash,
          role: row.role,
          team_ids: row.team_ids,
        };
      }
    } catch (err) {
      console.warn('[login api] PostgreSQL connection failed, falling back to in-memory store:', err.message);
    }

    // 2. Fall back to In-Memory store
    if (!user) {
      user = await findUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 4. Create Access & Refresh Tokens
    const { accessToken, refreshToken } = createTokens(user);

    return NextResponse.json({
      user: {
        userId: user.id,
        orgId: user.org_id,
        teamIds: user.team_ids || [],
        role: user.role,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[login api] error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
