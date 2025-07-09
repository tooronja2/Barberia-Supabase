// PWA Comprehensive Diagnostics
console.log('🔍 PWA Comprehensive Diagnostics Starting...');

async function runPWADiagnostics() {
    const results = {
        https: false,
        manifest: false,
        serviceWorker: false,
        icons: false,
        startUrl: false,
        display: false,
        themeColor: false,
        name: false,
        scope: false,
        installable: false
    };

    // 1. Check HTTPS
    results.https = location.protocol === 'https:' || 
                   location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1';
    
    console.log(`${results.https ? '✅' : '❌'} HTTPS: ${location.protocol}//${location.hostname}`);

    // 2. Check Manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
        try {
            const manifestResponse = await fetch(manifestLink.href);
            const manifest = await manifestResponse.json();
            results.manifest = true;
            
            // Check manifest fields
            results.name = !!(manifest.name || manifest.short_name);
            results.startUrl = !!manifest.start_url;
            results.display = manifest.display === 'standalone' || 
                            manifest.display === 'fullscreen' || 
                            manifest.display === 'minimal-ui';
            results.themeColor = !!manifest.theme_color;
            results.scope = !!manifest.scope;
            results.icons = manifest.icons && manifest.icons.length > 0;
            
            console.log(`✅ Manifest loaded: ${manifestLink.href}`);
            console.log(`${results.name ? '✅' : '❌'} Name: ${manifest.name || manifest.short_name}`);
            console.log(`${results.startUrl ? '✅' : '❌'} Start URL: ${manifest.start_url}`);
            console.log(`${results.display ? '✅' : '❌'} Display: ${manifest.display}`);
            console.log(`${results.themeColor ? '✅' : '❌'} Theme Color: ${manifest.theme_color}`);
            console.log(`${results.scope ? '✅' : '❌'} Scope: ${manifest.scope}`);
            console.log(`${results.icons ? '✅' : '❌'} Icons: ${manifest.icons?.length || 0} found`);
            
            // Check icon sizes
            if (manifest.icons) {
                const has192 = manifest.icons.some(icon => icon.sizes?.includes('192x192'));
                const has512 = manifest.icons.some(icon => icon.sizes?.includes('512x512'));
                console.log(`${has192 ? '✅' : '❌'} 192x192 icon available`);
                console.log(`${has512 ? '✅' : '❌'} 512x512 icon available`);
            }
            
        } catch (error) {
            console.error('❌ Manifest error:', error);
        }
    } else {
        console.log('❌ No manifest link found');
    }

    // 3. Check Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            results.serviceWorker = !!registration;
            console.log(`${results.serviceWorker ? '✅' : '❌'} Service Worker: ${registration ? 'Active' : 'Not registered'}`);
            
            if (registration) {
                console.log(`   State: ${registration.active?.state || 'Unknown'}`);
                console.log(`   Scope: ${registration.scope}`);
            }
        } catch (error) {
            console.error('❌ Service Worker error:', error);
        }
    } else {
        console.log('❌ Service Worker not supported');
    }

    // 4. Check installability
    const installCriteria = [
        results.https,
        results.manifest,
        results.serviceWorker,
        results.icons,
        results.startUrl,
        results.display,
        results.name
    ];
    
    const passedCriteria = installCriteria.filter(Boolean).length;
    results.installable = passedCriteria >= 6; // Most criteria must pass
    
    console.log('\\n📊 PWA INSTALLABILITY REPORT:');
    console.log(`   Criteria passed: ${passedCriteria}/7`);
    console.log(`   ${results.installable ? '✅ Should be installable' : '❌ NOT installable'}`);
    
    // 5. Check current installation status
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
    
    console.log(`\\n📱 CURRENT STATE:`);
    console.log(`   Display mode: ${isStandalone ? 'standalone' : isFullscreen ? 'fullscreen' : isMinimalUI ? 'minimal-ui' : 'browser'}`);
    console.log(`   Is PWA: ${isStandalone || isFullscreen || isMinimalUI}`);
    
    // 6. Check beforeinstallprompt availability
    setTimeout(() => {
        const hasPrompt = window.deferredPrompt !== undefined;
        console.log(`\\n🔔 INSTALL PROMPT:`);
        console.log(`   beforeinstallprompt fired: ${hasPrompt}`);
        
        if (!hasPrompt) {
            console.log('\\n❌ PWA NOT INSTALLABLE - POSSIBLE REASONS:');
            console.log('   1. Already installed (check if running in standalone mode)');
            console.log('   2. Service Worker not properly registered/active');
            console.log('   3. Manifest not properly loaded or has errors');
            console.log('   4. Missing required manifest fields');
            console.log('   5. Icons not accessible or wrong format');
            console.log('   6. Not served over HTTPS (except localhost)');
            console.log('   7. Browser doesn\\'t support PWA installation');
            console.log('   8. User has dismissed install prompt too many times');
            
            console.log('\\n💡 NEXT STEPS:');
            console.log('   1. Check DevTools > Application > Manifest for errors');
            console.log('   2. Check DevTools > Application > Service Workers status');
            console.log('   3. Try incognito/private mode');
            console.log('   4. Clear all browser data for this site');
            console.log('   5. Check Network tab for failed requests');
            
            // Additional debugging
            console.log('\\n🔍 DETAILED STATUS:');
            console.log('   Current URL:', window.location.href);
            console.log('   User Agent:', navigator.userAgent);
            console.log('   Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
            console.log('   Manifest element:', document.querySelector('link[rel="manifest"]'));
            
            // Try to fetch manifest manually
            fetch('./manifest.json')
                .then(response => response.json())
                .then(manifest => {
                    console.log('   Manifest loaded successfully:', manifest);
                })
                .catch(error => {
                    console.error('   ❌ Manifest fetch failed:', error);
                });
        }
    }, 3000);
    
    return results;
}

// Run diagnostics
window.addEventListener('load', runPWADiagnostics);

// Export for manual testing
window.runPWADiagnostics = runPWADiagnostics;