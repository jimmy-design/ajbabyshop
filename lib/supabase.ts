import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(url && key);
// Auth and database requests run in the browser; avoid opening a Realtime
// client while Next.js renders on the server (including Node versions < 22).
export const supabase =
  typeof window !== "undefined" && url && key ? createClient(url, key) : null;
