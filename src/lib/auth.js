import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/* ---------- env ---------- */

const JWT_SECRET = process.env.JWT_SECRET ?? 'CHANGE_ME_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'CHANGE_ME_jwt_refresh_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

const SALT_ROUNDS = 12;

/* ---------- role hierarchy ---------- */

/** @enum {number} */
const ROLE_WEIGHT = Object.freeze({
  guest: 0,
  member: 1,
  org_admin: 2,
});

/* ---------- token helpers ---------- */

/**
 * Build the JWT payload from a user record.
 *
 * @param {{ id: string, org_id?: string, team_ids?: string[], role?: string, email: string, name?: string }} user
 * @returns {{ userId: string, orgId: string|null, teamIds: string[], role: string, email: string, name: string }}
 */
function buildPayload(user) {
  return {
    userId: user.id,
    orgId: user.org_id ?? null,
    teamIds: Array.isArray(user.team_ids) ? user.team_ids : [],
    role: user.role ?? 'member',
    email: user.email,
    name: user.name ?? '',
  };
}

/**
 * Create an access + refresh token pair for a user.
 *
 * @param {{ id: string, org_id?: string, team_ids?: string[], role?: string, email: string, name?: string }} user
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function createTokens(user) {
  const payload = buildPayload(user);

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'nexus',
    subject: payload.userId,
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'nexus',
      subject: payload.userId,
    },
  );

  return { accessToken, refreshToken };
}

/**
 * Verify an access token and return the decoded payload.
 *
 * @param {string} token
 * @returns {{ userId: string, orgId: string|null, teamIds: string[], role: string, email: string, name: string }}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { issuer: 'nexus' });
}

/**
 * Verify a refresh token and return the decoded payload.
 *
 * @param {string} token
 * @returns {{ userId: string, type: 'refresh' }}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET, { issuer: 'nexus' });
}

/* ---------- password helpers ---------- */

/**
 * Hash a plaintext password with bcrypt.
 *
 * @param {string} password - Plaintext password
 * @returns {Promise<string>} Bcrypt hash
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 *
 * @param {string} password - Plaintext password
 * @param {string} hash     - Stored bcrypt hash
 * @returns {Promise<boolean>} true if they match
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/* ---------- request-level middleware ---------- */

/**
 * Extract and verify a JWT from the `Authorization: Bearer <token>` header.
 *
 * Works with both the Web Request API (App Router) and plain objects that
 * expose a `headers` map or `.get()` method.
 *
 * @param {Request | { headers: Headers | Record<string, string> }} request
 * @returns {{ userId: string, orgId: string|null, teamIds: string[], role: string, email: string, name: string } | null}
 *   Decoded user payload, or `null` if the token is missing / invalid.
 */
export function authMiddleware(request) {
  try {
    let authHeader;

    if (typeof request.headers?.get === 'function') {
      // Standard Request / NextRequest
      authHeader = request.headers.get('authorization');
    } else if (request.headers && typeof request.headers === 'object') {
      // Plain object (e.g. Socket.IO handshake)
      authHeader = request.headers.authorization ?? request.headers.Authorization;
    }

    if (!authHeader || typeof authHeader !== 'string') return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    const token = parts[1];
    return verifyToken(token);
  } catch {
    return null;
  }
}

/* ---------- role helpers ---------- */

/**
 * Check whether a user's role meets or exceeds the required role.
 *
 * Hierarchy (highest → lowest): `org_admin > member > guest`
 *
 * @param {{ role: string }} userPayload - Decoded JWT payload
 * @param {'guest' | 'member' | 'org_admin'} requiredRole
 * @returns {boolean}
 */
export function checkRole(userPayload, requiredRole) {
  const userWeight = ROLE_WEIGHT[userPayload?.role] ?? -1;
  const requiredWeight = ROLE_WEIGHT[requiredRole] ?? Infinity;
  return userWeight >= requiredWeight;
}

/**
 * Return the team IDs from the user payload so queries can be scoped
 * to only the teams the caller belongs to.
 *
 * Org admins receive `null` to signify "all teams" (no filter).
 *
 * @param {{ role: string, teamIds: string[] }} userPayload
 * @returns {string[] | null} Array of team IDs, or `null` for unrestricted access
 */
export function getTeamScopedFilter(userPayload) {
  if (!userPayload) return [];

  // Org admins can see everything
  if (userPayload.role === 'org_admin') return null;

  return Array.isArray(userPayload.teamIds) ? userPayload.teamIds : [];
}
