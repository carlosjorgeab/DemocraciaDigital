import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey) && supabaseUrl.length > 10;
const isAdminConfigured = Boolean(supabaseUrl) && Boolean(serviceRoleKey);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

export const supabaseAdmin = isAdminConfigured
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-service-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

console.log('🔧 Supabase Config:', {
  urlConfigured: Boolean(supabaseUrl),
  anonConfigured: Boolean(supabaseAnonKey),
  adminConfigured: isAdminConfigured,
  isConfigured,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET',
});
