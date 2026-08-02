import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.SUPABASE_KEY_SERVICE_ROLE || '';
try {
  const url = new URL(supabaseUrl);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Invalid protocol');
  }
} catch (e) {
  supabaseUrl = 'https://zavwqwjjzqjksnpitnqz.supabase.co';
}
const supabaseAnonKey = process.env.SUPABASE_KEY_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphdndxd2pqenFqa3NucGl0bnF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDgyNDQ5MywiZXhwIjoyMDkwNDAwNDkzfQ.A8ypXMHsDXqpQSSBY8XuyPOJkLM8twYvdPbpgtJA55g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
