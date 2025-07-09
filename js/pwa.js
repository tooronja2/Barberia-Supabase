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
        
        // Wait for beforeinstallprompt or show manual instructions
        setTimeout(() => {
            const installButton = document.getElementById('installButton');
            if (installButton && !deferredPrompt) {
                console.log('🔍 PWA Debug: No beforeinstallprompt after 3 seconds');
                
                // Check if this is a PWA-capable browser
                const userAgent = navigator.userAgent.toLowerCase();
                const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge');
                const isEdge = userAgent.includes('edge');
                const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
                const isFirefox = userAgent.includes('firefox');
                
                // Only show button in browsers that support PWA installation
                if (isChrome || isEdge || isSafari) {
                    installButton.style.display = 'inline-flex';
                    installButton.textContent = '📱 Instalar App';
                    console.log('🔍 PWA Debug: Showing install button for PWA-capable browser');
                } else {
                    console.log('❌ PWA Debug: Browser does not support PWA installation');
                }
            }
        }, 3000);
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
                
                // Check browser and device
                const userAgent = navigator.userAgent.toLowerCase();
                const isAndroid = userAgent.includes('android');
                const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');
                const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge');
                const isEdge = userAgent.includes('edge');
                const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
                const isDesktop = !isAndroid && !isIOS;
                
                console.log('🔍 Browser detection:', { isAndroid, isIOS, isChrome, isEdge, isSafari, isDesktop });
                
                let message = '📱 INSTALAR COMO APLICACIÓN:\\n\\n';
                
                if (isIOS && isSafari) {
                    message += '✅ Tu PWA está lista para instalar!\\n\\n';
                    message += '1. Toca el botón COMPARTIR (□↗) abajo\\n';
                    message += '2. Selecciona "Agregar a pantalla de inicio"\\n';
                    message += '3. Confirma "Agregar"\\n\\n';
                    message += '¡Luego podrás acceder como app desde tu pantalla de inicio!';
                } else if (isAndroid && isChrome) {
                    message += '✅ Tu PWA está lista para instalar!\\n\\n';
                    message += '1. Toca el menú de Chrome (⋮)\\n';
                    message += '2. Selecciona "Agregar a pantalla de inicio"\\n';
                    message += '3. Confirma "Agregar"\\n\\n';
                    message += '¡Luego podrás acceder como app desde tu pantalla de inicio!';
                } else if (isAndroid && isEdge) {
                    message += '✅ Tu PWA está lista para instalar!\\n\\n';
                    message += '1. Toca el menú de Edge (⋯)\\n';
                    message += '2. Ve a "Aplicaciones"\\n';
                    message += '3. Selecciona "Instalar esta aplicación"\\n';
                    message += '4. Confirma "Instalar"';
                } else if (isDesktop && (isChrome || isEdge)) {
                    message += '✅ Tu PWA está lista para instalar!\\n\\n';
                    message += '1. Busca el ícono de instalación en la barra de direcciones\\n';
                    message += '2. O usa el menú > "Instalar aplicación"\\n';
                    message += '3. Confirma "Instalar"\\n\\n';
                    message += '¡Luego aparecerá en tu escritorio/menú inicio!';
                } else {
                    message += 'Para la mejor experiencia PWA:\\n\\n';
                    message += '• En Android: usa Chrome o Edge\\n';
                    message += '• En iOS: usa Safari\\n';
                    message += '• En Desktop: usa Chrome o Edge\\n\\n';
                    message += '¡Recarga la página en el navegador recomendado!';
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
