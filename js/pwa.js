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
        // Force show button for testing (remove in production)
        const installButton = document.getElementById('installButton');
        if (installButton) {
            console.log('🔍 PWA Debug: Install button found, showing for testing');
            installButton.style.display = 'inline-flex';
            installButton.textContent = '📱 Test Install';
        }
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
                alert('La aplicación no se puede instalar en este momento. Intenta desde Chrome/Edge en Android o Safari en iOS.');
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
