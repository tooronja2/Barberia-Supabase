// Script to insert initial data into Supabase database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aooxkgxqdzddwfojfipd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvb3hrZ3hxZHpkZHdmb2pmaXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzU3NTgsImV4cCI6MjA2NzIxMTc1OH0.4Pp-gqb7ZCMVl7txSCM2wTxxXv1CPWZ1phCMyLUK5fQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function insertInitialData() {
    try {
        console.log('Inserting initial data...')
        
        // Insert barbers
        const { data: barbersData, error: barbersError } = await supabase
            .from('barbers')
            .insert([
                {
                    name: 'Héctor Medina',
                    specialty: 'Corte y barba clásico',
                    photo_url: null,
                    is_active: true
                },
                {
                    name: 'Lucas Peralta',
                    specialty: 'Estilos modernos',
                    photo_url: null,
                    is_active: true
                },
                {
                    name: 'Camila González',
                    specialty: 'Tratamientos capilares',
                    photo_url: null,
                    is_active: true
                }
            ])
            .select()
        
        if (barbersError) throw barbersError
        console.log('Barbers inserted:', barbersData)
        
        // Insert services
        const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .insert([
                {
                    name: 'Corte de barba',
                    description: 'Perfilado y arreglo profesional de barba con técnicas tradicionales',
                    price: 6500,
                    duration_minutes: 30,
                    is_active: true
                },
                {
                    name: 'Corte de pelo',
                    description: 'Corte de pelo personalizado.',
                    price: 8500,
                    duration_minutes: 45,
                    is_active: true
                },
                {
                    name: 'Corte todo máquina',
                    description: 'Rapado a máquina en todo el cabello.',
                    price: 8000,
                    duration_minutes: 30,
                    is_active: true
                },
                {
                    name: 'Corte de pelo y barba',
                    description: 'Servicio completo: corte personalizado + arreglo de barba',
                    price: 9500,
                    duration_minutes: 60,
                    is_active: true
                },
                {
                    name: 'Diseños y dibujos',
                    description: 'Arte y creatividad en tu corte.',
                    price: 6500,
                    duration_minutes: 45,
                    is_active: true
                }
            ])
            .select()
        
        if (servicesError) throw servicesError
        console.log('Services inserted:', servicesData)
        
        // Insert barber schedules (Monday to Friday 9-12, 14-19, Saturday 9-17)
        const scheduleData = []
        for (let barberId = 1; barberId <= 3; barberId++) {
            // Monday to Friday
            for (let day = 1; day <= 5; day++) {
                scheduleData.push({
                    barber_id: barberId,
                    day_of_week: day,
                    morning_start: '09:00',
                    morning_end: '12:00',
                    afternoon_start: '14:00',
                    afternoon_end: '19:00',
                    is_active: true
                })
            }
            // Saturday
            scheduleData.push({
                barber_id: barberId,
                day_of_week: 6,
                morning_start: '09:00',
                morning_end: '12:00',
                afternoon_start: '14:00',
                afternoon_end: '17:00',
                is_active: true
            })
        }
        
        const { data: schedulesData, error: schedulesError } = await supabase
            .from('barber_schedules')
            .insert(scheduleData)
            .select()
        
        if (schedulesError) throw schedulesError
        console.log('Barber schedules inserted:', schedulesData)
        
        console.log('All initial data inserted successfully!')
        
    } catch (error) {
        console.error('Error inserting data:', error)
    }
}

// Run the insertion
insertInitialData()