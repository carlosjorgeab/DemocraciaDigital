const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY_SERVICE_ROLE);
async function run() {
  const { data, error } = await supabase.from('deputado').select('*').limit(1);
  console.log(data);
}
run();
