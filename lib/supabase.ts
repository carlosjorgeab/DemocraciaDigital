import { createClient } from '@supabase/supabase-js';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

const FALLBACK_URL = 'https://zavwqwjjzqjksnpitnqz.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphdndxd2pqenFqa3NucGl0bnF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDgyNDQ5MywiZXhwIjoyMDkwNDAwNDkzfQ.A8ypXMHsDXqpQSSBY8XuyPOJkLM8twYvdPbpgtJA55g';

function isValidHttpUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const supabaseUrl = isValidHttpUrl(rawUrl) ? rawUrl : FALLBACK_URL;
const supabaseKey = rawKey || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

