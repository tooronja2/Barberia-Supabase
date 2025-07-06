const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://aooxkgxqdzddwfojfipd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvb3hrZ3hxZHpkZHdmb2pmaXBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTYzNTc1OCwiZXhwIjoyMDY3MjExNzU4fQ.7kj1J-tgX5WIHSBv8KIHbL_D6DM9JUzu3-aSizw6n5I';

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating barbershop tables...\n');

  // Table creation queries
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

// Run the function
createTables();