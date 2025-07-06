const { Client } = require('pg');

// PostgreSQL connection configuration for Supabase
const connectionString = 'postgresql://postgres:your_password@db.aooxkgxqdzddwfojfipd.supabase.co:5432/postgres';

// Since we don't have the actual database password, let's try using the service role key approach
// We'll need to use a different method

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aooxkgxqdzddwfojfipd.supabase.co';
const supabaseServiceKey = 'REPLACE_WITH_YOUR_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesUsingRPC() {
  console.log('Creating barbershop tables using RPC...\n');

  // First, let's create the exec_sql function if it doesn't exist
  const createExecSQLFunction = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
      RETURN json_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
    $$;
  `;

  try {
    console.log('Creating exec_sql function...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createExecSQLFunction
    });
    
    if (error) {
      console.log('Function creation failed, trying alternative approach...');
      // Alternative: try to create tables directly through the table creation API
      await createTablesDirectly();
      return;
    }
    
    console.log('✓ exec_sql function created successfully');
  } catch (err) {
    console.log('Function creation failed, trying alternative approach...');
    await createTablesDirectly();
    return;
  }

  // Now create the tables
  const tables = [
    {
      name: 'barbers',
      query: `
        CREATE TABLE IF NOT EXISTS barbers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          specialty VARCHAR(200),
          photo_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'services',
      query: `
        CREATE TABLE IF NOT EXISTS services (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true
        );
      `
    },
    {
      name: 'barber_schedules',
      query: `
        CREATE TABLE IF NOT EXISTS barber_schedules (
          id SERIAL PRIMARY KEY,
          barber_id INTEGER REFERENCES barbers(id),
          day_of_week INTEGER NOT NULL,
          morning_start TIME,
          morning_end TIME,
          afternoon_start TIME,
          afternoon_end TIME,
          is_active BOOLEAN DEFAULT true
        );
      `
    },
    {
      name: 'barber_days_off',
      query: `
        CREATE TABLE IF NOT EXISTS barber_days_off (
          id SERIAL PRIMARY KEY,
          barber_id INTEGER REFERENCES barbers(id),
          off_date DATE NOT NULL,
          reason VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'appointments',
      query: `
        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          observations TEXT,
          appointment_date DATE NOT NULL,
          appointment_time TIME NOT NULL,
          barber_id INTEGER REFERENCES barbers(id),
          service_type VARCHAR(100) NOT NULL,
          service_price DECIMAL(10,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'confirmado',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    }
  ];

  // Execute each table creation query
  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.name}...`);
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: table.query
      });
      
      if (error) {
        console.error(`Error creating table ${table.name}:`, error);
      } else {
        console.log(`✓ Table ${table.name} created successfully`);
      }
    } catch (err) {
      console.error(`Exception creating table ${table.name}:`, err.message);
    }
  }

  console.log('\nTable creation process completed!');
}

async function createTablesDirectly() {
  console.log('Attempting to create tables using direct table creation API...\n');
  
  // Since we can't execute raw SQL, let's try to create the tables using the table creation endpoint
  // This is a workaround approach
  
  console.log('Note: Direct table creation through API is limited.');
  console.log('For full table creation with all constraints, you should use the Supabase Dashboard or CLI.');
  console.log('Navigate to: https://app.supabase.com/project/aooxkgxqdzddwfojfipd/editor');
  console.log('');
  console.log('SQL Commands to execute in the SQL Editor:');
  console.log('');
  
  const sqlCommands = [
    `-- 1. Create barbers table
CREATE TABLE barbers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(200),
  photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);`,

    `-- 2. Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true
);`,

    `-- 3. Create barber_schedules table
CREATE TABLE barber_schedules (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id),
  day_of_week INTEGER NOT NULL,
  morning_start TIME,
  morning_end TIME,
  afternoon_start TIME,
  afternoon_end TIME,
  is_active BOOLEAN DEFAULT true
);`,

    `-- 4. Create barber_days_off table
CREATE TABLE barber_days_off (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id),
  off_date DATE NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);`,

    `-- 5. Create appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  observations TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  barber_id INTEGER REFERENCES barbers(id),
  service_type VARCHAR(100) NOT NULL,
  service_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmado',
  created_at TIMESTAMP DEFAULT NOW()
);`
  ];

  sqlCommands.forEach((command, index) => {
    console.log(command);
    console.log('');
  });

  console.log('Copy and paste these commands into the Supabase SQL Editor to create the tables.');
}

// Run the function
createTablesUsingRPC();