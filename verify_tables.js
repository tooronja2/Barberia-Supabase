const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aooxkgxqdzddwfojfipd.supabase.co';
const supabaseAnonKey = 'REPLACE_WITH_YOUR_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTables() {
  console.log('Verifying table creation...\n');
  
  const tablesToCheck = ['barbers', 'services', 'barber_schedules', 'barber_days_off', 'appointments'];
  
  for (const tableName of tablesToCheck) {
    try {
      console.log(`Checking table: ${tableName}...`);
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      
      if (error) {
        console.error(`❌ Table ${tableName} error:`, error.message);
      } else {
        console.log(`✅ Table ${tableName} exists and is accessible`);
      }
    } catch (err) {
      console.error(`❌ Table ${tableName} exception:`, err.message);
    }
  }
  
  console.log('\nTable verification completed!');
  console.log('\nIf you see errors above, please:');
  console.log('1. Go to https://app.supabase.com/project/aooxkgxqdzddwfojfipd/editor');
  console.log('2. Copy and paste the SQL from barbershop_tables.sql');
  console.log('3. Execute the SQL script');
  console.log('4. Run this verification script again');
}

verifyTables();