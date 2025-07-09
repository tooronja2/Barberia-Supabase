// PWA Installation Checker - Detects exactly why beforeinstallprompt isn't firing
console.log('🔍 PWA Installation Checker loaded');

async function checkPWAInstallability() {
    console.log('\\n🔍 CHECKING PWA INSTALLABILITY REQUIREMENTS...');
    
    const checks = {};
    let passedChecks = 0;
    let totalChecks = 0;
    
    // Helper function to log check results
    function logCheck(name, passed, message) {
        totalChecks++;
        if (passed) passedChecks++;
        checks[name] = passed;
        console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
    }
    
    // 1. HTTPS Check
    const isHTTPS = location.protocol === 'https:' || 
                   location.hostname === 'localhost' || 
                   location.hostname === '127.0.0.1';
    logCheck('HTTPS', isHTTPS, `${location.protocol}//${location.hostname}`);
    
    // 2. Service Worker Check
    const swSupported = 'serviceWorker' in navigator;
    logCheck('SW_SUPPORTED', swSupported, swSupported ? 'Service Worker supported' : 'Service Worker not supported');
    
    let swRegistered = false;
    let swActive = false;
    if (swSupported) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            swRegistered = !!registration;
            swActive = registration && registration.active && registration.active.state === 'activated';
            logCheck('SW_REGISTERED', swRegistered, swRegistered ? `Registered at ${registration.scope}` : 'Not registered');
            logCheck('SW_ACTIVE', swActive, swActive ? 'Service Worker active' : 'Service Worker not active');
        } catch (error) {
            logCheck('SW_REGISTERED', false, `Error checking SW: ${error.message}`);
            logCheck('SW_ACTIVE', false, 'Cannot check SW status');
        }
    }
    
    // 3. Manifest Check
    const manifestLink = document.querySelector('link[rel="manifest"]');
    logCheck('MANIFEST_LINK', !!manifestLink, manifestLink ? `Found: ${manifestLink.href}` : 'No manifest link found');
    
    let manifestValid = false;
    let manifestData = null;
    if (manifestLink) {
        try {
            const response = await fetch(manifestLink.href);
            if (response.ok) {
                manifestData = await response.json();
                manifestValid = true;
                logCheck('MANIFEST_FETCH', true, 'Manifest fetched successfully');
            } else {
                logCheck('MANIFEST_FETCH', false, `HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            logCheck('MANIFEST_FETCH', false, `Fetch error: ${error.message}`);
        }
    }
    
    // 4. Manifest Content Checks
    if (manifestData) {
        logCheck('MANIFEST_NAME', !!(manifestData.name || manifestData.short_name), 
                manifestData.name || manifestData.short_name || 'Missing');
        logCheck('MANIFEST_START_URL', !!manifestData.start_url, 
                manifestData.start_url || 'Missing');
        logCheck('MANIFEST_DISPLAY', manifestData.display === 'standalone' || 
                manifestData.display === 'fullscreen' || manifestData.display === 'minimal-ui', 
                manifestData.display || 'Missing');
        logCheck('MANIFEST_ICONS', manifestData.icons && manifestData.icons.length > 0, 
                manifestData.icons ? `${manifestData.icons.length} icons` : 'No icons');
        
        // Check for required icon sizes
        if (manifestData.icons) {
            const has192 = manifestData.icons.some(icon => icon.sizes && icon.sizes.includes('192x192'));
            const has512 = manifestData.icons.some(icon => icon.sizes && icon.sizes.includes('512x512'));
            logCheck('ICON_192', has192, has192 ? '192x192 icon found' : '192x192 icon missing');
            logCheck('ICON_512', has512, has512 ? '512x512 icon found' : '512x512 icon missing');
        }
    }
    
    // 5. Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    logCheck('NOT_INSTALLED', !isStandalone, isStandalone ? 'Already installed' : 'Not installed');
    
    // 6. Check icon accessibility
    if (manifestData && manifestData.icons) {
        console.log('\\n🔍 CHECKING ICON ACCESSIBILITY...');
        for (const icon of manifestData.icons) {
            try {
                const iconResponse = await fetch(icon.src);
                logCheck(`ICON_${icon.sizes}`, iconResponse.ok, 
                        iconResponse.ok ? `Accessible (${iconResponse.status})` : `Failed (${iconResponse.status})`);
            } catch (error) {
                logCheck(`ICON_${icon.sizes}`, false, `Error: ${error.message}`);
            }
        }
    }
    
    // 7. Browser Support Check
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge');
    const isEdge = userAgent.includes('edge');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isFirefox = userAgent.includes('firefox');
    const supportsPWA = isChrome || isEdge || (isSafari && userAgent.includes('mobile'));
    
    logCheck('BROWSER_SUPPORT', supportsPWA, 
            `${isChrome ? 'Chrome' : isEdge ? 'Edge' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'Unknown'} ${supportsPWA ? 'supports' : 'limited support'}`);
    
    // Summary
    console.log('\\n📊 INSTALLABILITY SUMMARY:');
    console.log(`   Checks passed: ${passedChecks}/${totalChecks}`);
    console.log(`   Minimum required: ${totalChecks - 2} (allowing for some flexibility)`);
    
    const shouldBeInstallable = passedChecks >= (totalChecks - 2);
    console.log(`   Should be installable: ${shouldBeInstallable ? 'YES' : 'NO'}`);
    
    if (!shouldBeInstallable) {
        console.log('\\n❌ CRITICAL ISSUES TO FIX:');
        for (const [check, passed] of Object.entries(checks)) {
            if (!passed && !check.includes('BROWSER_SUPPORT')) {
                console.log(`   - ${check.replace('_', ' ')}`);
            }
        }
    }
    
    // Check for common issues
    console.log('\\n🔍 COMMON PWA INSTALLATION BLOCKERS:');
    
    if (!isHTTPS) {
        console.log('   ❌ HTTPS required (except localhost)');
    }
    
    if (!swRegistered || !swActive) {
        console.log('   ❌ Service Worker must be registered and active');
    }
    
    if (!manifestValid) {
        console.log('   ❌ Manifest must be valid and accessible');
    }
    
    if (manifestData && (!manifestData.icons || manifestData.icons.length === 0)) {
        console.log('   ❌ At least one icon required in manifest');
    }
    
    if (isStandalone) {
        console.log('   ℹ️  App appears to be already installed');
    }
    
    console.log('\\n💡 SUGGESTED ACTIONS:');
    console.log('   1. Open DevTools > Application > Manifest (check for errors)');
    console.log('   2. Open DevTools > Application > Service Workers (verify active)');
    console.log('   3. Check Network tab for failed requests');
    console.log('   4. Try incognito mode to reset install state');
    console.log('   5. Clear all site data and reload');
    
    return {
        passed: passedChecks,
        total: totalChecks,
        installable: shouldBeInstallable,
        checks: checks
    };
}

// Run the check
window.addEventListener('load', () => {
    setTimeout(checkPWAInstallability, 2000);
});

// Export for manual testing
window.checkPWAInstallability = checkPWAInstallability;