// Client-side Supabase instance — safe to use in the browser.
// Uses the public URL + anon key (data access is still protected by
// Row Level Security policies defined in supabase/schema.sql).
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
