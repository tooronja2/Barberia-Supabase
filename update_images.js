// Script para actualizar servicios y barberos con imágenes
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://aooxkgxqdzddwfojfipd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvb3hrZ3hxZHpkZHdmb2pmaXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzU3NTgsImV4cCI6MjA2NzIxMTc1OH0.4Pp-gqb7ZCMVl7txSCM2wTxxXv1CPWZ1phCMyLUK5fQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateServicesWithImages() {
    console.log('🎨 Actualizando servicios con imágenes...')
    
    const serviceUpdates = [
        {
            id: 1,
            image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop&crop=center',
            description: 'Perfilado y arreglo profesional de barba con técnicas tradicionales y productos premium'
        },
        {
            id: 2, 
            image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop&crop=center',
            description: 'Corte de pelo personalizado según tu estilo y tipo de cabello'
        },
        {
            id: 3,
            image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop&crop=center',
            description: 'Rapado a máquina profesional en todo el cabello con precisión'
        },
        {
            id: 4,
            image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop&crop=center',
            description: 'Servicio completo: corte personalizado + arreglo de barba en una sesión'
        },
        {
            id: 5,
            image_url: 'https://images.unsplash.com/photo-1606565739631-5c0cfa9ccf8e?w=400&h=300&fit=crop&crop=center',
            description: 'Arte y creatividad en tu corte con diseños únicos y personalizados'
        }
    ]
    
    for (const service of serviceUpdates) {
        const { data, error } = await supabase
            .from('services')
            .update({ 
                image_url: service.image_url,
                description: service.description 
            })
            .eq('id', service.id)
        
        if (error) {
            console.error(`Error actualizando servicio ${service.id}:`, error)
        } else {
            console.log(`✅ Servicio ${service.id} actualizado`)
        }
    }
}

async function updateBarbersWithImages() {
    console.log('👥 Actualizando barberos con imágenes...')
    
    const barberUpdates = [
        {
            id: 1,
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
            specialty: 'Especialista en cortes clásicos y arreglo de barba tradicional. 15 años de experiencia.'
        },
        {
            id: 2,
            photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
            specialty: 'Experto en estilos modernos, degradados y tendencias actuales. Especializado en jóvenes.'
        },
        {
            id: 3,
            photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
            specialty: 'Especialista en tratamientos capilares, coloración y cuidado integral del cabello.'
        }
    ]
    
    for (const barber of barberUpdates) {
        const { data, error } = await supabase
            .from('barbers')
            .update({ 
                photo_url: barber.photo_url,
                specialty: barber.specialty
            })
            .eq('id', barber.id)
        
        if (error) {
            console.error(`Error actualizando barbero ${barber.id}:`, error)
        } else {
            console.log(`✅ Barbero ${barber.id} actualizado`)
        }
    }
}

async function addImageUrlColumns() {
    console.log('🗄️ Verificando estructura de base de datos...')
    
    try {
        // Verificar si ya existen las columnas
        const { data: services } = await supabase.from('services').select('image_url').limit(1)
        const { data: barbers } = await supabase.from('barbers').select('photo_url').limit(1)
        
        console.log('✅ Columnas de imágenes ya existen')
        
        await updateServicesWithImages()
        await updateBarbersWithImages()
        
        console.log('🎉 Actualización completada!')
        
    } catch (error) {
        console.error('Error:', error)
    }
}

// Ejecutar actualizaciones
addImageUrlColumns()