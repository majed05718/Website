const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTables() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking database tables...\n');

  // Check offices table
  console.log('1️⃣ Checking OFFICES table:');
  const { data: offices, error: officesErr } = await supabase
    .from('offices')
    .select('*')
    .limit(1);
  
  if (officesErr) {
    console.log('❌ Error:', officesErr.message);
  } else {
    console.log('✅ Table exists');
    if (offices.length > 0) {
      console.log('   Columns:', Object.keys(offices[0]).join(', '));
    } else {
      console.log('   (empty table - need to insert to see columns)');
    }
  }

  // Check user_permissions table
  console.log('\n2️⃣ Checking USER_PERMISSIONS table:');
  const { data: users, error: usersErr } = await supabase
    .from('user_permissions')
    .select('*')
    .limit(1);
  
  if (usersErr) {
    console.log('❌ Error:', usersErr.message);
  } else {
    console.log('✅ Table exists');
    if (users.length > 0) {
      console.log('   Columns:', Object.keys(users[0]).join(', '));
    } else {
      console.log('   (empty table)');
    }
  }

  // Try to describe tables using SQL
  console.log('\n3️⃣ Trying to get table structure...');
  
  // List all tables
  console.log('\n📋 All tables in public schema:');
  const { data: tables, error: tablesErr } = await supabase
    .rpc('exec_sql', { 
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 
    })
    .catch(() => null);
  
  if (!tablesErr && tables) {
    console.log(tables);
  } else {
    console.log('Cannot fetch via RPC (may need to enable)');
  }
}

checkTables().catch(console.error);
