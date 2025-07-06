import { db } from './supabase.js';
import { serviceImages, getServiceImageWithFallback } from './service-images.js';

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await loadServices();
    setupSmoothScrolling();
});

// Load services from database
async function loadServices() {
    console.log('🎨 Cargando servicios dinámicamente desde Supabase...');
    
    const servicesGrid = document.getElementById('servicesGrid');
    
    // FORCE FRESH LOAD: Skip cache to ensure latest centralized images
    console.log('🔄 FORCED REFRESH: Skipping cache to use latest centralized images');
    
    // Clear old cache to prevent conflicts
    sessionStorage.removeItem('barberia_services');
    
    // Show loading state
    showLoading(servicesGrid, 'Cargando servicios...', 'Obteniendo información desde la base de datos');
    
    // Images are now managed centrally in service-images.js
    console.log('📸 Using centralized service image configuration');
    
    // FORCE STATIC SERVICES: Use centralized image system directly
    console.log('🎯 FORZANDO servicios estáticos con sistema centralizado para garantizar sincronización');
    await loadStaticServices(servicesGrid);
}

// Render services function
function renderServices(services, container) {
    const servicesHTML = services.map((service, index) => {
        // CRITICAL: Use dynamic duration from Supabase
        const duration = service.duration_minutes || 15; // fallback to 15 if missing
        return `
            <div class="service-card" style="animation-delay: ${index * 0.1}s" data-service-id="${service.id}" data-duration="${duration}">
                <img src="${service.image_url}" alt="${service.name}" class="service-image" loading="lazy">
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <div class="service-price">$${service.price.toLocaleString()}</div>
                <div class="service-duration" style="color: #b8b8b8; font-size: 0.9rem; margin-top: 0.5rem;">
                    ⏱️ ${duration} minutos
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = servicesHTML;
    
    // Store services globally for reservation page sync
    window.barberiaCentralServices = services;
}

// Fallback static services with LOCAL IMAGES
async function loadStaticServices(servicesGrid) {
    console.log('📋 Loading static services with local images...');
    
    const staticServicesBase = [
        {
            id: 1,
            name: "Corte de barba",
            description: "Perfilado y arreglo profesional de barba con técnicas tradicionales",
            price: 6500,
            duration_minutes: 15
        },
        {
            id: 2,
            name: "Corte de pelo",
            description: "Corte de pelo personalizado según tu estilo y preferencias",
            price: 8500,
            duration_minutes: 15
        },
        {
            id: 3,
            name: "Corte todo máquina",
            description: "Rapado a máquina profesional en todo el cabello",
            price: 8000,
            duration_minutes: 15
        },
        {
            id: 4,
            name: "Corte de pelo y barba",
            description: "Servicio completo: corte personalizado + arreglo de barba",
            price: 9500,
            duration_minutes: 30
        },
        {
            id: 5,
            name: "Diseños y dibujos",
            description: "Arte y creatividad en tu corte con patrones únicos",
            price: 6500,
            duration_minutes: 30
        }
    ];
    
    // Add local images with fallback
    const staticServices = await Promise.all(
        staticServicesBase.map(async service => ({
            ...service,
            image_url: await getServiceImageWithFallback(service.name)
        }))
    );
    
    // Render the services
    renderServices(staticServices, servicesGrid);
    
    // Store static services globally for reservation page sync
    window.barberiaCentralServices = staticServices;
}

// Loading state utilities
function showLoading(container, title = 'Cargando...', subtitle = '') {
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">${title}</div>
            ${subtitle ? `<div class="loading-subtitle">${subtitle}</div>` : ''}
        </div>
    `;
}

function hideLoading(container) {
    const loadingContainer = container.querySelector('.loading-container');
    if (loadingContainer) {
        loadingContainer.remove();
    }
}

// Cache utilities
function cacheData(key, data) {
    try {
        const cacheObject = {
            data: data,
            timestamp: Date.now(),
            expires: Date.now() + (5 * 60 * 1000) // 5 minutes
        };
        sessionStorage.setItem(`barberia_${key}`, JSON.stringify(cacheObject));
        console.log(`📦 Datos cacheados para ${key}`);
    } catch (error) {
        console.warn('❌ Error al cachear datos:', error);
    }
}

function getCachedData(key) {
    try {
        const cached = sessionStorage.getItem(`barberia_${key}`);
        if (!cached) return null;
        
        const cacheObject = JSON.parse(cached);
        
        // Check if expired
        if (Date.now() > cacheObject.expires) {
            sessionStorage.removeItem(`barberia_${key}`);
            console.log(`🗑️ Cache expirado para ${key}`);
            return null;
        }
        
        console.log(`📦 Datos recuperados del cache para ${key}`);
        return cacheObject.data;
    } catch (error) {
        console.warn('❌ Error al leer cache:', error);
        return null;
    }
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add click animations to service cards
document.addEventListener('click', (e) => {
    if (e.target.closest('.service-card')) {
        const card = e.target.closest('.service-card');
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }
});

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Add mobile menu button if screen is small
if (window.innerWidth <= 768) {
    const navContainer = document.querySelector('.nav-container');
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.style.cssText = `
        background: none;
        border: none;
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
        display: block;
    `;
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    navContainer.appendChild(mobileMenuBtn);
}