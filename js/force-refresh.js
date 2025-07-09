// Script para forzar la recarga de recursos en móvil (Android e iOS)
document.addEventListener('DOMContentLoaded', function() {
    // Función para forzar la recarga de hojas de estilo
    function forceStyleRefresh() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(sheet => {
            // Añadir timestamp aleatorio para forzar recarga
            const url = sheet.href.split('?')[0];
            const timestamp = Date.now();
            sheet.href = url + '?v=' + timestamp;
        });
        
        console.log('✅ Estilos recargados forzosamente para asegurar compatibilidad en Android e iOS');
    }
    
    // Detectar si el usuario está en móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // En móvil, forzar la recarga después de un breve retraso
        setTimeout(forceStyleRefresh, 500);
        
        // También forzar actualización en cambio de orientación
        window.addEventListener('orientationchange', function() {
            setTimeout(forceStyleRefresh, 300);
        });
    }
});
