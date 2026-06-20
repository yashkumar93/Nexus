import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createTokens } from '@/lib/auth';
import { findUserByEmail, saveUser } from '@/lib/auth-store';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // 1. Check if email already registered (Database first, then In-Memory)
    let emailExists = false;
    try {
      const result = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        emailExists = true;
      }
    } catch (err) {
      console.warn('[register api] PostgreSQL query failed, checking in-memory:', err.message);
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        emailExists = true;
      }
    }

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }

    const userId = crypto.randomUUID();
    const orgId = 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0'; // Seed Org ID
    const defaultTeamId = 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef'; // Seed Eng Team ID
    const hashedPassword = await hashPassword(password);
    const role = 'member';

    const newUser = {
      id: userId,
      org_id: orgId,
      name,
      email,
      password_hash: hashedPassword,
      role,
      team_ids: [defaultTeamId],
    };

    // 2. Try inserting into PostgreSQL
    try {
      // Ensure organization exists
      await query(
        `INSERT INTO organizations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [orgId, 'Continuum Labs']
      );

      // Ensure default team exists
      await query(
        `INSERT INTO teams (id, org_id, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [defaultTeamId, orgId, 'Engineering']
      );

      // Insert user
      await query(
        `INSERT INTO users (id, org_id, name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, orgId, name, email, hashedPassword, role]
      );

      // Map to default team
      await query(
        `INSERT INTO user_teams (user_id, team_id) VALUES ($1, $2)`,
        [userId, defaultTeamId]
      );

      console.log('[register api] user successfully saved to Postgres database');
    } catch (err) {
      console.warn('[register api] failed to write to database, fallback to in-memory:', err.message);
    }

    // 3. Save to In-Memory store (always, as a runtime cache/fallback)
    await saveUser(newUser);

    // 4. Create Access & Refresh Tokens
    const { accessToken, refreshToken } = createTokens(newUser);

    return NextResponse.json({
      user: {
        userId: newUser.id,
        orgId: newUser.org_id,
        teamIds: newUser.team_ids,
        role: newUser.role,
        email: newUser.email,
        name: newUser.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[register api] error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
