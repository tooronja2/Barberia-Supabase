// PWA Debug Helper
console.log('🔍 PWA Debug Helper loaded');

// Check PWA requirements
function checkPWARequirements() {
    const results = {
        https: location.protocol === 'https:' || location.hostname === 'localhost',
        serviceWorker: 'serviceWorker' in navigator,
        manifest: !!document.querySelector('link[rel="manifest"]'),
        icons: false,
        display: false
    };
    
    // Check manifest
    if (results.manifest) {
        fetch('manifest.json')
            .then(response => response.json())
            .then(manifest => {
                results.icons = manifest.icons && manifest.icons.length > 0;
                results.display = manifest.display === 'standalone' || manifest.display === 'fullscreen';
                
                console.log('📱 PWA Requirements Check:', results);
                
                if (!results.https) {
                    console.warn('❌ PWA: HTTPS required for PWA installation');
                }
                if (!results.serviceWorker) {
                    console.warn('❌ PWA: Service Worker not supported');
                }
                if (!results.manifest) {
                    console.warn('❌ PWA: Manifest not found');
                }
                if (!results.icons) {
                    console.warn('❌ PWA: Icons not found in manifest');
                }
                if (!results.display) {
                    console.warn('❌ PWA: Display mode not set to standalone');
                }
                
                const allPassed = Object.values(results).every(Boolean);
                console.log(allPassed ? '✅ PWA: All requirements met' : '❌ PWA: Some requirements missing');
            })
            .catch(error => {
                console.error('❌ PWA: Error loading manifest:', error);
            });
    }
}

// Run check when page loads
window.addEventListener('load', checkPWARequirements);

// Monitor beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ PWA Debug: beforeinstallprompt event detected - PWA is installable!');
});

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ PWA Debug: App is running as installed PWA');
} else {
    console.log('📱 PWA Debug: App is running in browser mode');
}