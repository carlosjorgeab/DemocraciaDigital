const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT__SUPABASE_URL, process.env.NEXT__SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('usuarios').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
