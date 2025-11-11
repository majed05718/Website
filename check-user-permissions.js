const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkUserPermissions() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking user_permissions table structure...\n');

  // Try to select to see columns
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error:', error.message);
    console.log('Code:', error.code);
  } else if (data.length > 0) {
    console.log('✅ Table exists with data');
    console.log('\n📋 Columns found:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('\n📊 Sample row:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('✅ Table exists but is empty');
    console.log('Cannot determine columns from empty table');
  }

  // Try to insert empty to see what's required
  console.log('\n🔍 Trying to detect required columns...');
  const { error: insertError } = await supabase
    .from('user_permissions')
    .insert({})
    .select();

  if (insertError) {
    console.log('\n📋 Required fields or constraints:');
    console.log('Message:', insertError.message);
    console.log('Details:', insertError.details);
    console.log('Hint:', insertError.hint);
  }
}

checkUserPermissions().catch(console.error);
