// PWA Installation Logic
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'inline-block';
    }
});

// Handle install button click
document.addEventListener('DOMContentLoaded', () => {
    const installButton = document.getElementById('installButton');
    
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Show the prompt
                deferredPrompt.prompt();
                
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                
                // Clear the deferredPrompt
                deferredPrompt = null;
                
                // Hide the install button
                installButton.style.display = 'none';
                
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
            }
        });
    }
});

// Handle app installation
window.addEventListener('appinstalled', (evt) => {
    console.log('App was installed');
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'none';
    }
});

// Check if app is already installed
window.addEventListener('load', () => {
    // Check if app is in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is running in standalone mode');
        const installButton = document.getElementById('installButton');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }
});
