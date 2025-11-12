#!/usr/bin/env ts-node
/**
 * SuperAdmin User Seeder Script
 * 
 * This script creates the first system administrator user in the database.
 * 
 * Usage:
 *   npm run seed:superadmin -- --email="admin@example.com" --password="YourSecurePassword123!" --name="Admin Name"
 * 
 * Requirements:
 *   - Supabase connection configured in .env file
 *   - Strong password (min 12 characters recommended)
 *   - Valid email address
 */

import * as bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(title: string) {
  console.log('\n' + '═'.repeat(60));
  log(`  ${title}`, colors.bold + colors.cyan);
  console.log('═'.repeat(60) + '\n');
}

async function main() {
  logHeader('🔐 SuperAdmin User Seeder');

  // Load environment variables
  const envPath = path.resolve(__dirname, '../../../.env');
  const result = dotenv.config({ path: envPath });
  
  // Also try environment-specific files
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envPathSpecific = path.resolve(__dirname, `../../../.env.${nodeEnv}`);
  dotenv.config({ path: envPathSpecific });

  if (result.error && !process.env.SUPABASE_URL) {
    log('❌ Error: Could not load .env file', colors.red);
    log(`   Searched at: ${envPath}`, colors.yellow);
    log('   Please ensure .env file exists with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', colors.yellow);
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const argMap: Record<string, string> = {};

  args.forEach((arg) => {
    const match = arg.match(/^--([^=]+)=(.+)$/);
    if (match) {
      argMap[match[1]] = match[2].replace(/^["']|["']$/g, ''); // Remove quotes
    }
  });

  const email = argMap.email;
  const password = argMap.password;
  const name = argMap.name || 'System Administrator';
  const phone = argMap.phone || '+966500000000';

  // Validate input
  if (!email || !password) {
    log('❌ Error: Missing required arguments', colors.red);
    log('\nUsage:', colors.yellow);
    log('  npm run seed:superadmin -- --email="admin@example.com" --password="SecurePassword123!" --name="Admin Name"', colors.cyan);
    log('\nRequired arguments:', colors.yellow);
    log('  --email      Email address for the admin user', colors.cyan);
    log('  --password   Strong password (min 12 characters recommended)', colors.cyan);
    log('\nOptional arguments:', colors.yellow);
    log('  --name       Full name (default: "System Administrator")', colors.cyan);
    log('  --phone      Phone number (default: "+966500000000")', colors.cyan);
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    log('❌ Error: Invalid email format', colors.red);
    process.exit(1);
  }

  // Validate password strength
  if (password.length < 8) {
    log('❌ Error: Password must be at least 8 characters long', colors.red);
    log('   Recommended: 12+ characters with mixed case, numbers, and symbols', colors.yellow);
    process.exit(1);
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set', colors.red);
    log('   Please check your .env file configuration', colors.yellow);
    process.exit(1);
  }

  log('🔗 Connecting to Supabase...', colors.cyan);
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Check if user already exists
    log('🔍 Checking if user already exists...', colors.cyan);
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      log(`❌ Error: User with email "${email}" already exists`, colors.red);
      log(`   User ID: ${existingUser.id}`, colors.yellow);
      process.exit(1);
    }

    // Create a default "System" office if it doesn't exist
    log('🏢 Checking for system office...', colors.cyan);
    let systemOffice = await supabase
      .from('offices')
      .select('id')
      .eq('office_code', 'system')
      .single();

    let officeId: string;

    if (!systemOffice.data) {
      log('🏢 Creating system office...', colors.cyan);
      const { data: newOffice, error: officeError } = await supabase
        .from('offices')
        .insert({
          office_code: 'system',
          office_name: 'System Administration',
                    whatsapp_number: '+966500000000',
        })
        .select()
        .single();

      if (officeError) {
        log('❌ Error creating system office: ' + officeError.message, colors.red);
        throw officeError;
      }

      officeId = newOffice.id;
      log('✅ System office created', colors.green);
    } else {
      officeId = systemOffice.data.id;
      log('✅ System office found', colors.green);
    }

    // Hash password
    log('🔒 Hashing password...', colors.cyan);
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create superadmin user
    log('👤 Creating superadmin user...', colors.cyan);
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        office_id: officeId,
        name: name,
        phone: phone,
        email: email,
        role: 'system_admin',
        password_hash: passwordHash,
        is_active: true,
        status: 'active',
        permissions: {
          all: true,
          system_admin: true,
        },
      })
      .select()
      .single();

    if (userError) {
      log('❌ Error creating user: ' + userError.message, colors.red);
      throw userError;
    }

    // Success!
    logHeader('✅ SuperAdmin User Created Successfully!');
    log('User Details:', colors.bold);
    log(`  ID:        ${newUser.id}`, colors.cyan);
    log(`  Email:     ${newUser.email}`, colors.cyan);
    log(`  Name:      ${newUser.name}`, colors.cyan);
    log(`  Phone:     ${newUser.phone}`, colors.cyan);
    log(`  Role:      ${newUser.role}`, colors.cyan);
    log(`  Office ID: ${newUser.office_id}`, colors.cyan);
    log(`  Active:    ${newUser.is_active}`, colors.green);
    console.log('═'.repeat(60));
    log('\n🎉 You can now login with these credentials!', colors.green + colors.bold);
    log('   Email:    ' + email, colors.cyan);
    log('   Password: (the password you provided)', colors.cyan);
    console.log();

  } catch (error: any) {
    log('\n❌ Fatal Error:', colors.red + colors.bold);
    log(error.message || error, colors.red);
    console.log();
    process.exit(1);
  }
}

// Run the script
main();
