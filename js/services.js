document.addEventListener('DOMContentLoaded', function() {
    // Asegurarse de que todos los íconos tengan la misma altura
    const serviceIcons = document.querySelectorAll('.service-icon');
    const maxHeight = Math.max(...Array.from(serviceIcons).map(icon => icon.offsetHeight));
    
    serviceIcons.forEach(icon => {
        icon.style.height = `${maxHeight}px`;
    });
    
    // Ajustar altura de tarjetas si es necesario
    const serviceCards = document.querySelectorAll('.service-card');
    
    function equalizeCardHeights() {
        // Resetear alturas
        serviceCards.forEach(card => {
            card.style.height = 'auto';
        });
        
        // Solo igualar alturas en vista de rejilla (no en móvil vertical)
        if (window.innerWidth >= 480) {
            // Agrupar tarjetas por filas
            const rows = {};
            serviceCards.forEach(card => {
                const top = card.getBoundingClientRect().top;
                if (!rows[top]) rows[top] = [];
                rows[top].push(card);
            });
            
            // Igualar altura en cada fila
            Object.values(rows).forEach(row => {
                const maxHeight = Math.max(...row.map(card => card.offsetHeight));
                row.forEach(card => {
                    card.style.height = `${maxHeight}px`;
                });
            });
        }
    }
    
    // Ejecutar al cargar y al redimensionar
    equalizeCardHeights();
    window.addEventListener('resize', equalizeCardHeights);
});
