const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyTables() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Verifying database tables...\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const tables = ['offices', 'user_permissions', 'properties', 'refresh_tokens'];
  let allGood = true;

  for (const table of tables) {
    process.stdout.write(`Checking ${table}... `);
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);

    if (error) {
      console.log('❌ NOT FOUND');
      console.log(`   Error: ${error.message}\n`);
      allGood = false;
    } else {
      console.log('✅ EXISTS\n');
    }
  }

  console.log('═══════════════════════════════════════════════════════════\n');

  if (allGood) {
    console.log('✅ All required tables exist!');
    console.log('\n🚀 You can now run:');
    console.log('   npm run seed:superadmin -- \\');
    console.log('     --email="az22722101239oz@gmail.com" \\');
    console.log('     --password="Az143134" \\');
    console.log('     --name="azoz" \\');
    console.log('     --phone="+966557431343"');
  } else {
    console.log('❌ Some tables are missing!');
    console.log('\n📋 Please create tables in Supabase SQL Editor:');
    console.log('   https://app.supabase.com/project/mbpznkqyeofxluqwybyo/sql/new');
    console.log('\n   Use the SQL script from /workspace/simple-db-setup.sql');
  }

  console.log('\n');
}

verifyTables().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
