import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer the service-role key for server-side writes (bypasses RLS).
// Falls back to the publishable/anon key if the service-role key is not set.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL and a Supabase key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be set.',
  );
}

/**
 * Server-side Supabase client.
 *
 * Uses the service-role key when available so that all server API routes can
 * read and write without being blocked by Row Level Security policies.
 * If only the publishable/anon key is provided, make sure your RLS policies
 * allow the required operations.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Disable automatic session handling — this is a pure server client.
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default supabase;
