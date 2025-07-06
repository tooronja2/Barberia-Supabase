// Enhanced Scroll Animations with Intersection Observer
console.log('🎬 Inicializando sistema de animaciones al scroll...');

// Animation classes to add to CSS
const animationClasses = {
    fadeInUp: 'animate-fade-in-up',
    fadeInLeft: 'animate-fade-in-left',
    fadeInRight: 'animate-fade-in-right',
    zoomIn: 'animate-zoom-in',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    bounceIn: 'animate-bounce-in'
};

// Enhanced viewport effects
const viewportEffects = {
    parallax: 'parallax-effect',
    countUp: 'count-up-effect',
    progressBar: 'progress-bar-effect',
    typewriter: 'typewriter-effect'
};

// Intersection Observer configuration
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Create intersection observer
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const animationType = element.dataset.animation;
            const delay = element.dataset.delay || 0;
            
            // Apply animation with delay
            setTimeout(() => {
                element.classList.add('animate-visible');
                if (animationType && animationClasses[animationType]) {
                    element.classList.add(animationClasses[animationType]);
                }
                console.log(`✨ Animación activada: ${animationType} con delay ${delay}ms`);
            }, parseInt(delay));
            
            // Stop observing this element
            animationObserver.unobserve(element);
        }
    });
}, observerOptions);

// Parallax scroll effect for hero section
function initializeParallaxEffects() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (scrolled < window.innerHeight) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Initialize scroll animations when DOM is ready
function initializeScrollAnimations() {
    console.log('🔍 Buscando elementos para animar...');
    
    // Define elegant animation targets for different sections
    const animationTargets = [
        // Hero section with enhanced effects
        { selector: '.hero h1', animation: 'fadeInUp', delay: 0 },
        { selector: '.hero p', animation: 'fadeInUp', delay: 200 },
        { selector: '.cta-button', animation: 'zoomIn', delay: 400 },
        
        // Services section with staggered animations
        { selector: '.services h2', animation: 'fadeInUp', delay: 0 },
        { selector: '.service-card', animation: 'fadeInUp', staggered: true, delay: 100 },
        
        // Contact section with directional entrance
        { selector: '.contact-info', animation: 'fadeInLeft', delay: 0 },
        { selector: '.contact-map', animation: 'fadeInRight', delay: 100 },
        { selector: '.contact-button', animation: 'fadeInUp', staggered: true, delay: 50 },
        
        // Header logo and nav
        { selector: '.logo', animation: 'zoomIn', delay: 0 },
        { selector: '.nav-menu li', animation: 'fadeInUp', staggered: true, delay: 50 },
        
        // Footer
        { selector: '.footer', animation: 'fadeInUp', delay: 0 }
    ];
    
    // Apply animations to elements
    animationTargets.forEach(target => {
        const elements = document.querySelectorAll(target.selector);
        console.log(`📝 Encontrados ${elements.length} elementos para ${target.selector}`);
        
        elements.forEach((element, index) => {
            // Set animation attributes
            element.dataset.animation = target.animation;
            
            // Calculate delay for staggered animations
            let totalDelay = target.delay;
            if (target.staggered) {
                totalDelay += index * 100; // 100ms between each element for elegance
            }
            element.dataset.delay = totalDelay;
            
            // Add initial hidden state
            element.classList.add('animate-hidden');
            
            // Start observing
            animationObserver.observe(element);
            
            console.log(`👀 Observando: ${target.selector} #${index} (delay: ${totalDelay}ms)`);
        });
    });
}

// Enhanced scroll listener for navbar, parallax and progress
function initializeAdvancedScrollEffects() {
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scrollProgress');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // Update scroll progress indicator
        if (scrollProgress) {
            scrollProgress.style.width = `${scrollPercent}%`;
        }
        
        // Auto-hide/show navbar on scroll
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
                header.style.transition = 'transform 0.3s ease-in-out';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
                header.style.transition = 'transform 0.3s ease-in-out';
            }
        }
        
        lastScrollTop = scrollTop;
    });
}

// Service card hover enhancement
function initializeServiceCardEffects() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.transition = 'transform 0.3s ease-out';
            card.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        });
    });
}

// Initialize all effects when DOM is loaded
function initializeAllAnimations() {
    initializeScrollAnimations();
    initializeParallaxEffects();
    initializeAdvancedScrollEffects();
    
    // Delay service card effects until cards are loaded
    setTimeout(() => {
        initializeServiceCardEffects();
    }, 1000);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllAnimations);
} else {
    initializeAllAnimations();
}

// Export for manual testing
window.reinitializeScrollAnimations = initializeAllAnimations;
window.testParallax = initializeParallaxEffects;
window.testServiceHover = initializeServiceCardEffects;

console.log('✅ Sistema completo de animaciones y efectos cargado');