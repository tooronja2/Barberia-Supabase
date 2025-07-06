// Google Maps Integration for Barbería Central
// Real Buenos Aires location with professional barbershop styling

// Barbería Central Location - Real Buenos Aires coordinates
const BARBERIA_LOCATION = {
    lat: -34.6037, // Buenos Aires City Center
    lng: -58.3816
};

const BARBERIA_INFO = {
    name: "Barbería Central",
    address: "Av. Central 1234, Buenos Aires",
    phone: "+54 11 1234-5678",
    email: "info@barberiacentral.com",
    hours: "Lun-Vie: 9:00-19:00 | Sáb: 9:00-17:00"
};

// Initialize Google Map
function initMap() {
    console.log('🗺️ Initializing Google Maps...');
    
    // Hide loading indicator
    const loadingDiv = document.querySelector('.map-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }

    // Map options with premium barbershop styling
    const mapOptions = {
        zoom: 16,
        center: BARBERIA_LOCATION,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "weight": "2.00"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#9c9c9c"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 45
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#7b7b7b"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#46bcec"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#c8d7d4"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#070707"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            }
        ],
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
    };

    // Create the map
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Custom marker icon for barbershop
    const markerIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C8.95 0 0 8.95 0 20c0 11.05 20 30 20 30s20-18.95 20-30C40 8.95 31.05 0 20 0z" fill="#d4af37"/>
                <circle cx="20" cy="20" r="12" fill="#1a202c"/>
                <path d="M15 16h10v8h-10z" fill="#d4af37"/>
                <circle cx="17" cy="18" r="1" fill="#1a202c"/>
                <circle cx="23" cy="18" r="1" fill="#1a202c"/>
                <path d="M16 22h8" stroke="#1a202c" stroke-width="1" stroke-linecap="round"/>
            </svg>
        `),
        scaledSize: new google.maps.Size(40, 50),
        anchor: new google.maps.Point(20, 50)
    };

    // Create marker
    const marker = new google.maps.Marker({
        position: BARBERIA_LOCATION,
        map: map,
        title: BARBERIA_INFO.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP
    });

    // Create info window with premium styling
    const infoWindowContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 300px; padding: 10px;">
            <h3 style="color: #d4af37; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                ${BARBERIA_INFO.name}
            </h3>
            <div style="color: #333; line-height: 1.5;">
                <p style="margin: 5px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">📍</span>
                    <strong>${BARBERIA_INFO.address}</strong>
                </p>
                <p style="margin: 5px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">📞</span>
                    <a href="tel:${BARBERIA_INFO.phone}" style="color: #d4af37; text-decoration: none;">
                        ${BARBERIA_INFO.phone}
                    </a>
                </p>
                <p style="margin: 5px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">📧</span>
                    <a href="mailto:${BARBERIA_INFO.email}" style="color: #d4af37; text-decoration: none;">
                        ${BARBERIA_INFO.email}
                    </a>
                </p>
                <p style="margin: 5px 0; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🕒</span>
                    <span style="font-size: 14px;">${BARBERIA_INFO.hours}</span>
                </p>
                <div style="margin-top: 15px; text-align: center;">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${BARBERIA_LOCATION.lat},${BARBERIA_LOCATION.lng}" 
                       target="_blank" 
                       style="background-color: #d4af37; color: #1a202c; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 8px;">
                        🧭 Cómo llegar
                    </a>
                    <a href="reserva.html" 
                       style="background-color: #38a169; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                        📅 Reservar
                    </a>
                </div>
            </div>
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 350
    });

    // Show info window on marker click
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    // Add click listener to map to close info window
    map.addListener('click', () => {
        infoWindow.close();
    });

    // Add responsive behavior
    const handleResize = () => {
        google.maps.event.trigger(map, 'resize');
        map.setCenter(BARBERIA_LOCATION);
    };

    window.addEventListener('resize', handleResize);

    console.log('✅ Google Maps loaded successfully');
    
    // Add subtle animation to marker after map loads
    setTimeout(() => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
            marker.setAnimation(null);
        }, 2000);
    }, 1000);
}

// Fallback if Google Maps fails to load
window.initMapError = function() {
    console.error('❌ Google Maps failed to load');
    const mapDiv = document.getElementById('map');
    const loadingDiv = document.querySelector('.map-loading');
    
    if (mapDiv) {
        mapDiv.style.display = 'none';
    }
    
    if (loadingDiv) {
        loadingDiv.innerHTML = `
            <div style="text-align: center; color: #e53e3e;">
                ⚠️ No se pudo cargar el mapa<br>
                <a href="https://www.google.com/maps/search/Av.+Central+1234,+Buenos+Aires" 
                   target="_blank" 
                   style="color: #d4af37; text-decoration: underline; font-size: 14px;">
                   Ver en Google Maps
                </a>
            </div>
        `;
    }
};

// Export for global access
window.initMap = initMap;

console.log('🗺️ Google Maps script loaded');