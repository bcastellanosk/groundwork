import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tifkemzwngjqfufcaczk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZmtlbXp3bmdqcWZ1ZmNhY3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDU0MjUsImV4cCI6MjA5MzUyMTQyNX0.chswWGtIPRsqKiUUPl8LW5wzyFqH5DyuDsX5X4WY4vw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
