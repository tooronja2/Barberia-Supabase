// Service Images Configuration - CENTRALIZED
// Todas las imágenes de servicios se gestionan desde aquí

export const serviceImages = {
    'Corte de barba': 'data/public/corte de barba.png',
    'Corte de pelo': 'data/public/corte de pelo.png', 
    'Corte todo máquina': 'data/public/corte todo maquina.png',
    'Corte de pelo y barba': 'data/public/corte de pelo y barba.png',
    'Diseños y dibujos': 'data/public/diseños y dibujos.png'
};

// Función para obtener imagen de servicio con fallback
export function getServiceImage(serviceName) {
    return serviceImages[serviceName] || serviceImages['Corte de barba']; // fallback a corte de barba
}

// Función para verificar si una imagen existe
export async function verifyImageExists(imagePath) {
    try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.warn(`⚠️ Image not found: ${imagePath}`);
        return false;
    }
}

// Fallback a Unsplash si las imágenes locales no están disponibles
export const fallbackImages = {
    'Corte de barba': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=250&fit=crop',
    'Corte de pelo': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=250&fit=crop',
    'Corte todo máquina': 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=250&fit=crop',
    'Corte de pelo y barba': 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop',
    'Diseños y dibujos': 'https://images.unsplash.com/photo-1606565739631-5c0cfa9ccf8e?w=400&h=250&fit=crop'
};

// Función para obtener imagen con fallback automático
export async function getServiceImageWithFallback(serviceName) {
    const localImage = getServiceImage(serviceName);
    const imageExists = await verifyImageExists(localImage);
    
    if (imageExists) {
        console.log(`✅ Using local image for ${serviceName}: ${localImage}`);
        return localImage;
    } else {
        console.log(`⚠️ Local image not found for ${serviceName}, using fallback`);
        return fallbackImages[serviceName] || fallbackImages['Corte de barba'];
    }
}

// Log de configuración
console.log('📸 Service Images Configuration loaded');
console.log('Local images:', Object.keys(serviceImages).length);
console.log('Fallback images:', Object.keys(fallbackImages).length);