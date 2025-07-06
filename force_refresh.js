// FORCE REFRESH - Clear cache and reload with ELEGANT DESIGN  
console.log('🔄 FORCING COMPLETE REFRESH WITH ELEGANT DESIGN...');

// Clear localStorage
localStorage.clear();
sessionStorage.clear();

// Force reload of services with images
function forceLoadServicesWithImages() {
    console.log('🎨 FORCING services with images...');
    const servicesGrid = document.getElementById('servicesGrid');
    
    if (servicesGrid) {
        const timestamp = Date.now();
        const services = [
            {
                name: "Corte de barba",
                description: "Perfilado y arreglo profesional de barba con técnicas tradicionales",
                price: 6500,
                image: `https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=250&fit=crop&t=${timestamp}`
            },
            {
                name: "Corte de pelo", 
                description: "Corte de pelo personalizado según tu estilo y preferencias",
                price: 8500,
                image: `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=250&fit=crop&t=${timestamp}`
            },
            {
                name: "Corte todo máquina",
                description: "Rapado a máquina profesional en todo el cabello", 
                price: 8000,
                image: `https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=250&fit=crop&t=${timestamp}`
            },
            {
                name: "Corte de pelo y barba",
                description: "Servicio completo: corte personalizado + arreglo de barba",
                price: 9500,
                image: `https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop&t=${timestamp}`
            },
            {
                name: "Diseños y dibujos",
                description: "Arte y creatividad en tu corte con patrones únicos",
                price: 6500,
                image: `https://images.unsplash.com/photo-1606565739631-5c0cfa9ccf8e?w=400&h=250&fit=crop&t=${timestamp}`
            }
        ];
        
        servicesGrid.innerHTML = services.map((service, index) => `
            <div class="service-card" style="animation-delay: ${index * 0.1}s">
                <img src="${service.image}" alt="${service.name}" class="service-image" loading="eager" 
                     style="width: 100% !important; height: 250px !important; object-fit: cover; display: block !important; border-radius: 15px; margin-bottom: 1rem;">
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <div class="service-price">$${service.price.toLocaleString()}</div>
            </div>
        `).join('');
        
        console.log('✅ Services with images FORCED');
        
        // Verify images loaded
        const images = servicesGrid.querySelectorAll('img');
        console.log(`🖼️ Found ${images.length} service images`);
        
        images.forEach((img, index) => {
            img.onload = () => console.log(`✅ Service image ${index + 1} loaded: ${img.src}`);
            img.onerror = () => console.error(`❌ Service image ${index + 1} failed: ${img.src}`);
        });
    }
}

// Force reload of barbers with photos  
function forceLoadBarbersWithPhotos() {
    console.log('👥 FORCING barbers with photos...');
    const barberSelection = document.getElementById('barberSelection');
    
    if (barberSelection) {
        const timestamp = Date.now();
        const barbers = [
            {
                id: 1,
                name: "Héctor Medina", 
                specialty: "Especialista en cortes clásicos y arreglo de barba tradicional. 15 años de experiencia.",
                photo: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&t=${timestamp}`
            },
            {
                id: 2,
                name: "Lucas Peralta",
                specialty: "Experto en estilos modernos, degradados y tendencias actuales. Especializado en jóvenes.", 
                photo: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&t=${timestamp}`
            },
            {
                id: 3,
                name: "Camila González",
                specialty: "Especialista en tratamientos capilares, coloración y cuidado integral del cabello.",
                photo: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face&t=${timestamp}`
            }
        ];
        
        barberSelection.innerHTML = barbers.map((barber, index) => `
            <div class="barber-card" data-barber-id="${barber.id}" style="animation-delay: ${index * 0.1}s">
                <div class="barber-photo" style="width: 120px; height: 120px; margin: 0 auto 1rem; border-radius: 50%; overflow: hidden; background: #f6ad37;">
                    <img src="${barber.photo}" alt="${barber.name}" loading="eager"
                         style="width: 100% !important; height: 100% !important; object-fit: cover; display: block !important;">
                </div>
                <h3>${barber.name}</h3>
                <p>${barber.specialty}</p>
            </div>
        `).join('');
        
        console.log('✅ Barbers with photos FORCED');
        
        // Verify images loaded
        const images = barberSelection.querySelectorAll('img');
        console.log(`🖼️ Found ${images.length} barber images`);
        
        images.forEach((img, index) => {
            img.onload = () => console.log(`✅ Barber image ${index + 1} loaded: ${img.src}`);
            img.onerror = () => console.error(`❌ Barber image ${index + 1} failed: ${img.src}`);
        });
    }
}

// Auto-execute when loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Check which page we're on
        if (window.location.pathname.includes('reserva.html') || document.getElementById('serviceSelection')) {
            console.log('🏗️ RESERVA PAGE: Forzando servicios en página de reservas...');
            forceLoadReservationServices();
            forceLoadBarbersWithPhotos();
        } else {
            console.log('🏠 MAIN PAGE: Forzando servicios en página principal...');
            forceLoadServicesWithImages();
        }
    }, 500);
});

// Force load services specifically for reservation page
function forceLoadReservationServices() {
    console.log('📋 FORCING reservation services...');
    const serviceSelection = document.getElementById('serviceSelection');
    
    if (serviceSelection) {
        // Force display of existing service cards
        const existingCards = serviceSelection.querySelectorAll('.service-card-reservation');
        console.log(`🎯 Found ${existingCards.length} existing service cards`);
        
        existingCards.forEach((card, index) => {
            // Force display
            card.style.display = 'block !important';
            card.style.visibility = 'visible !important';
            card.style.opacity = '1 !important';
            
            // Force images
            const img = card.querySelector('img');
            if (img) {
                img.style.display = 'block !important';
                img.style.visibility = 'visible !important';
                img.style.opacity = '1 !important';
                img.style.width = '100% !important';
                img.style.height = '200px !important';
                img.style.objectFit = 'cover !important';
                console.log(`✅ Service card ${index + 1} forced visible`);
            }
        });
        
        console.log('✅ Reservation services FORCED');
    } else {
        console.log('❌ serviceSelection not found');
    }
}

// Export functions for manual use
window.forceLoadServicesWithImages = forceLoadServicesWithImages;
window.forceLoadBarbersWithPhotos = forceLoadBarbersWithPhotos;
window.forceLoadReservationServices = forceLoadReservationServices;

console.log('🚀 Force refresh script loaded. Use forceLoadServicesWithImages() or forceLoadBarbersWithPhotos() manually if needed.');