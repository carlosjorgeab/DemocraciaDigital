const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT__SUPABASE_URL, process.env.SUPABASE_KEY_SERVICE_ROLE);
async function run() {
  const { data, error } = await supabase.from('deputado').select('*').limit(1);
  console.log(data, error);
}
run();
