// PWA Installation Logic
let deferredPrompt;

// Check PWA capabilities on load
window.addEventListener('load', () => {
    console.log('🔍 PWA Debug: Page loaded');
    console.log('🔍 PWA Debug: Service Worker support:', 'serviceWorker' in navigator);
    console.log('🔍 PWA Debug: Manifest link:', document.querySelector('link[rel="manifest"]'));
    console.log('🔍 PWA Debug: Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ PWA Debug: App is running in standalone mode');
        const installButton = document.getElementById('installButton');
        if (installButton) {
            installButton.style.display = 'none';
        }
    } else {
        console.log('📱 PWA Debug: App is running in browser mode');
        
        // Show install button for all users after a delay
        setTimeout(() => {
            const installButton = document.getElementById('installButton');
            if (installButton) {
                console.log('🔍 PWA Debug: Showing install button for all users');
                installButton.style.display = 'inline-flex';
                installButton.textContent = '📱 Instalar App';
            }
        }, 2000);
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ PWA Debug: beforeinstallprompt event fired');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'inline-flex';
        installButton.textContent = '📱 Instalar App';
        console.log('✅ PWA Debug: Install button shown');
    }
});

// Handle install button click
document.addEventListener('DOMContentLoaded', () => {
    const installButton = document.getElementById('installButton');
    
    if (installButton) {
        console.log('🔍 PWA Debug: Install button event listener attached');
        
        installButton.addEventListener('click', async () => {
            console.log('🔍 PWA Debug: Install button clicked');
            
            if (deferredPrompt) {
                console.log('✅ PWA Debug: Deferred prompt available, showing install prompt');
                
                try {
                    // Show the prompt
                    deferredPrompt.prompt();
                    
                    // Wait for the user to respond to the prompt
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`✅ PWA Debug: User response to the install prompt: ${outcome}`);
                    
                    // Clear the deferredPrompt
                    deferredPrompt = null;
                    
                    // Hide the install button
                    installButton.style.display = 'none';
                    
                    if (outcome === 'accepted') {
                        console.log('✅ PWA Debug: User accepted the install prompt');
                    } else {
                        console.log('❌ PWA Debug: User dismissed the install prompt');
                    }
                } catch (error) {
                    console.error('❌ PWA Debug: Error showing install prompt:', error);
                }
            } else {
                console.log('❌ PWA Debug: No deferred prompt available');
                
                // Check browser and show appropriate message
                const userAgent = navigator.userAgent.toLowerCase();
                const isAndroid = userAgent.includes('android');
                const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
                const isChrome = userAgent.includes('chrome');
                const isEdge = userAgent.includes('edge');
                const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
                
                let message = 'Para instalar esta aplicación:\\n\\n';
                
                if (isAndroid) {
                    if (isChrome) {
                        message += '• Usa el menú de Chrome (⋮) > "Agregar a pantalla de inicio"';
                    } else if (isEdge) {
                        message += '• Usa el menú de Edge (⋯) > "Aplicaciones" > "Instalar esta aplicación"';
                    } else {
                        message += '• Abre esta página en Chrome o Edge\\n• Busca "Agregar a pantalla de inicio" en el menú';
                    }
                } else if (isIOS) {
                    if (isSafari) {
                        message += '• Toca el botón Compartir (□↗)\\n• Selecciona "Agregar a pantalla de inicio"';
                    } else {
                        message += '• Abre esta página en Safari\\n• Usa Compartir > "Agregar a pantalla de inicio"';
                    }
                } else {
                    // Desktop
                    if (isChrome || isEdge) {
                        message += '• Busca el ícono de instalación en la barra de direcciones\\n• O usa el menú > "Instalar aplicación"';
                    } else {
                        message += '• Abre esta página en Chrome o Edge\\n• Busca la opción "Instalar aplicación"';
                    }
                }
                
                alert(message);
            }
        });
    } else {
        console.log('❌ PWA Debug: Install button not found');
    }
});

// Handle app installation
window.addEventListener('appinstalled', (evt) => {
    console.log('✅ PWA Debug: App was installed successfully');
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'none';
    }
});
