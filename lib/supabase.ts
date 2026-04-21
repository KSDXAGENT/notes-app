import { createClient } from "@supabase/supabase-js";

const cleanEnvValue = (value: string | undefined) =>
  value
    ?.replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();

const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

if (!/^https?:\/\//.test(supabaseUrl)) {
  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${JSON.stringify(supabaseUrl)}`,
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
