/**
 * In-memory user store fallback for Continuum.
 * Keeps user registrations active in the running server process if Postgres is down.
 */

export const MOCK_USERS = [
  {
    id: 'a0f90e0c-99d9-43c3-b9db-3f8c85b1a0d1',
    org_id: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
    name: 'Priya Patel',
    email: 'priya@continuum.ai',
    password_hash: '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76',
    role: 'org_admin',
    team_ids: ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c']
  },
  {
    id: 'b0f90e0c-99d9-43c3-b9db-3f8c85b1a0d2',
    org_id: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
    name: 'Devon Miller',
    email: 'devon@continuum.ai',
    password_hash: '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76',
    role: 'member',
    team_ids: ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef']
  },
  {
    id: 'c0f90e0c-99d9-43c3-b9db-3f8c85b1a0d3',
    org_id: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
    name: 'Sam Chen',
    email: 'sam@continuum.ai',
    password_hash: '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76',
    role: 'member',
    team_ids: ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef']
  },
  {
    id: 'd0f90e0c-99d9-43c3-b9db-3f8c85b1a0d4',
    org_id: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
    name: 'Nadia Ivanova',
    email: 'nadia@continuum.ai',
    password_hash: '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76',
    role: 'member',
    team_ids: ['f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c']
  },
  {
    id: 'e0f90e0c-99d9-43c3-b9db-3f8c85b1a0d5',
    org_id: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
    name: 'Maya Lin',
    email: 'maya@continuum.ai',
    password_hash: '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76',
    role: 'member',
    team_ids: ['f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c']
  },
  {
    id: 'f0f90e0c-99d9-43c3-b9db-3f8c85b1a0d6',
    org_id: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
    name: 'Sarah Jenkins',
    email: 'sarah@continuum.ai',
    password_hash: '$2b$12$zDgWwWrpIwgNMSeZauJLB.iTyxl.8P2piwIjc78zif1UqKpoIxw76',
    role: 'member',
    team_ids: ['f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c']
  }
];

// In-memory list to accumulate newly registered users
const registeredUsers = [...MOCK_USERS];

/**
 * Find user by email.
 * @param {string} email
 * @returns {Promise<any | null>}
 */
export async function findUserByEmail(email) {
  return registeredUsers.find(u => u.email === email) || null;
}

/**
 * Add a new user to the in-memory store.
 * @param {any} user
 * @returns {Promise<void>}
 */
export async function saveUser(user) {
  registeredUsers.push(user);
}
