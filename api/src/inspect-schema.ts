#!/usr/bin/env ts-node
/**
 * Database Schema Inspector
 * 
 * This script connects to the Supabase PostgreSQL database and extracts
 * the complete schema information for all tables in the public schema.
 * 
 * Output: JSON representation of the database schema
 */

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
  console.error(`${color}${message}${colors.reset}`);
}

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  ordinal_position: number;
}

interface ConstraintInfo {
  table_name: string;
  constraint_name: string;
  constraint_type: string;
  column_name: string;
  foreign_table_name: string | null;
  foreign_column_name: string | null;
}

interface TableSchema {
  table_name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: boolean;
    column_default: string | null;
    constraints: string[];
    character_maximum_length: number | null;
    ordinal_position: number;
  }>;
  primary_keys: string[];
  foreign_keys: Array<{
    column_name: string;
    foreign_table: string;
    foreign_column: string;
  }>;
  unique_constraints: string[][];
}

async function main() {
  log('════════════════════════════════════════════════════════════', colors.cyan + colors.bold);
  log('  📊 Database Schema Inspector', colors.cyan + colors.bold);
  log('════════════════════════════════════════════════════════════', colors.cyan + colors.bold);
  log('');

  // Load environment variables
  const envPath = path.resolve(__dirname, '../../.env');
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envPathSpecific = path.resolve(__dirname, `../../.env.${nodeEnv}`);
  
  dotenv.config({ path: envPath });
  dotenv.config({ path: envPathSpecific });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set', colors.red);
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
    // Get all tables
    log('📋 Fetching table list...', colors.cyan);
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      })
      .catch(async () => {
        // Fallback: query using postgrest
        const { data, error } = await supabase
          .from('_prisma_migrations')
          .select('*')
          .limit(0)
          .catch(() => ({ data: null, error: null }));
        
        // If RPC doesn't work, we'll query information_schema directly via SQL
        return { data: null, error: 'RPC not available' };
      });

    let tableList: string[] = [];
    
    if (tables && !tablesError) {
      tableList = tables.map((row: any) => row.table_name);
    } else {
      // Manual fallback - get tables from known entities
      log('⚠️  RPC not available, using fallback method...', colors.yellow);
      tableList = [
        'offices',
        'user_permissions',
        'properties',
        'customers',
        'customer_notes',
        'customer_interactions',
        'customer_properties',
        'appointments',
        'rental_contracts',
        'rental_payments',
        'maintenance_requests',
        'payment_alerts',
        'refresh_tokens',
        'staff_performance',
        'financial_analytics',
      ];
    }

    log(`✅ Found ${tableList.length} tables`, colors.green);
    log('');

    const schema: Record<string, TableSchema> = {};

    // For each table, get detailed schema
    for (const tableName of tableList) {
      log(`📊 Inspecting table: ${tableName}...`, colors.cyan);

      // Get columns
      const columnsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          udt_name,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          ordinal_position
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;

      // Get constraints
      const constraintsQuery = `
        SELECT 
          tc.table_name,
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = '${tableName}';
      `;

      try {
        // Execute queries using Supabase client
        const { data: columnsData } = await supabase.rpc('exec_sql', { sql: columnsQuery });
        const { data: constraintsData } = await supabase.rpc('exec_sql', { sql: constraintsQuery });

        if (!columnsData) {
          log(`  ⚠️  Could not fetch columns for ${tableName}`, colors.yellow);
          continue;
        }

        const columns: ColumnInfo[] = columnsData;
        const constraints: ConstraintInfo[] = constraintsData || [];

        // Build table schema
        const tableSchema: TableSchema = {
          table_name: tableName,
          columns: [],
          primary_keys: [],
          foreign_keys: [],
          unique_constraints: [],
        };

        // Process columns
        for (const col of columns) {
          const columnConstraints: string[] = [];
          
          // Check constraints for this column
          const colConstraints = constraints.filter(c => c.column_name === col.column_name);
          
          for (const constraint of colConstraints) {
            if (constraint.constraint_type === 'PRIMARY KEY') {
              columnConstraints.push('PRIMARY KEY');
              tableSchema.primary_keys.push(col.column_name);
            }
            if (constraint.constraint_type === 'UNIQUE') {
              columnConstraints.push('UNIQUE');
            }
            if (constraint.constraint_type === 'FOREIGN KEY' && constraint.foreign_table_name) {
              columnConstraints.push(`FK → ${constraint.foreign_table_name}(${constraint.foreign_column_name})`);
              tableSchema.foreign_keys.push({
                column_name: col.column_name,
                foreign_table: constraint.foreign_table_name,
                foreign_column: constraint.foreign_column_name || 'id',
              });
            }
          }

          tableSchema.columns.push({
            column_name: col.column_name,
            data_type: col.data_type === 'USER-DEFINED' ? col.udt_name : col.data_type,
            is_nullable: col.is_nullable === 'YES',
            column_default: col.column_default,
            constraints: columnConstraints,
            character_maximum_length: col.character_maximum_length,
            ordinal_position: col.ordinal_position,
          });
        }

        schema[tableName] = tableSchema;
        log(`  ✅ ${tableSchema.columns.length} columns`, colors.green);

      } catch (err: any) {
        log(`  ❌ Error inspecting ${tableName}: ${err.message}`, colors.red);
      }
    }

    log('');
    log('════════════════════════════════════════════════════════════', colors.cyan + colors.bold);
    log('✅ Schema inspection complete!', colors.green + colors.bold);
    log('════════════════════════════════════════════════════════════', colors.cyan + colors.bold);
    log('');

    // Output JSON to stdout (not stderr)
    console.log(JSON.stringify(schema, null, 2));

  } catch (error: any) {
    log('\n❌ Fatal Error:', colors.red + colors.bold);
    log(error.message || error, colors.red);
    process.exit(1);
  }
}

// Run the script
main();
