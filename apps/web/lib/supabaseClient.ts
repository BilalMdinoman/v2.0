import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Safe Supabase access for the dashboard. The frontend must never hold the
// service-role key. Reads happen through the anon key + RLS policies.
//
// Returns null until the environment variables are configured, so the UI can
// render an honest "not connected" state instead of crashing.

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cached = null;
    return null;
  }

  cached = createClient(url, anonKey);
  return cached;
}
