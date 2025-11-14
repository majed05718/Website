const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkSchema() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check users table structure by trying to select
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error querying users table:', error);
  } else {
    console.log('Users table columns:', data.length > 0 ? Object.keys(data[0]) : 'Table is empty');
  }

  // Try to see what columns are actually required
  const { error: insertError } = await supabase
    .from('users')
    .insert({})
    .select();

  if (insertError) {
    console.log('\nRequired fields error:', insertError.message);
    console.log('Details:', insertError.details);
  }
}

checkSchema();
