import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT__SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const serviceRoleKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT__SUPABASE_ANON_KEY ||
  ''
).trim();

const isValidHttpUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Only create admin client if valid URL is available; otherwise create a no-op stub
const isConfigured = isValidHttpUrl(supabaseUrl) && !!serviceRoleKey;

export const supabaseAdmin = isConfigured
  ? createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
  : createClient(
    'https://placeholder.supabase.co',
    'placeholder-service-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
