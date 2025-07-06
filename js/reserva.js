import { db, supabase } from './supabase.js';
import { getServiceImageWithFallback } from './service-images.js';

// Reservation state
let reservationState = {
    currentStep: 1,
    selectedService: null,
    selectedBarber: null,
    selectedDate: null,
    selectedTime: null,
    customerData: {}
};

// Manual test function
async function testConnection() {
    console.log('🧪 TESTING: Conexión manual a Supabase...');
    
    try {
        // Test 1: Direct supabase query
        console.log('🧪 Test 1: Consulta directa a Supabase...');
        const { data: testData, error: testError } = await supabase.from('barbers').select('*');
        console.log('🧪 Test 1 resultado:', { data: testData, error: testError });
        
        // Test 2: Through db helper
        console.log('🧪 Test 2: Consulta través de db helper...');
        const helperData = await db.getBarbers();
        console.log('🧪 Test 2 resultado:', helperData);
        
        // Test 3: Check table existence
        console.log('🧪 Test 3: Verificando existencia de tabla barbers...');
        const { data: tableData, error: tableError } = await supabase.from('barbers').select('count');
        console.log('🧪 Test 3 resultado:', { data: tableData, error: tableError });
        
    } catch (error) {
        console.error('🧪 Error en testing:', error);
    }
}

// Debug function for manual testing
window.debugGoToStep = function(stepNumber) {
    console.log(`🧪 MANUAL TEST: Navegando al paso ${stepNumber}`);
    goToStep(stepNumber);
}

// Debug function to check step containers
window.debugStepContainers = function() {
    console.log('🧪 DEBUGGING: Verificando todos los step containers');
    const stepContainers = document.querySelectorAll('.step-container');
    stepContainers.forEach((container, index) => {
        console.log(`   Paso ${container.dataset.step}: ${container.classList.toString()}`);
        const computedStyle = window.getComputedStyle(container);
        console.log(`   Display: ${computedStyle.display}, Visibility: ${computedStyle.visibility}`);
    });
}

// Debug function to test form validation
window.debugValidateForm = function() {
    console.log('🧪 TESTING: Validación de formulario');
    const result = validateForm();
    console.log('🧪 Resultado:', result);
    return result;
}

// Debug function to test complete flow
window.debugCompleteFlow = function() {
    console.log('🧪 TESTING: Flujo completo de reserva');
    
    // Test data
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('phone').value = '+54 11 1234-5678';
    document.getElementById('observations').value = 'Reserva de prueba';
    
    // Test validation
    const isValid = validateForm();
    console.log('🧪 Formulario válido:', isValid);
    
    if (isValid) {
        console.log('🧪 Probando navegación al paso 6...');
        updateConfirmationSummary();
        goToStep(6);
    }
}

// Initialize reservation page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando página de reservas...');
    
    // Services will be loaded by loadServices() function only
    
    // Run connection test first
    await testConnection();
    
    try {
        console.log('📋 Intentando cargar servicios dinámicos...');
        await loadServices();
        console.log('✅ Servicios cargados exitosamente');
        
        console.log('👥 Cargando barberos...');
        await loadBarbers();
        console.log('✅ Barberos cargados exitosamente');
        
        console.log('📅 Configurando calendario...');
        setupCalendar();
        console.log('✅ Calendario configurado');
        
        console.log('🧭 Configurando navegación...');
        setupNavigation();
        console.log('✅ Navegación configurada');
        
        console.log('✏️ Configurando validaciones...');
        setupFormValidation();
        console.log('✅ Validaciones configuradas');
        
        console.log('📝 Configurando auto-focus...');
        setupFormAutoFocus();
        console.log('✅ Auto-focus configurado');
        
        console.log('🎉 Inicialización completa');
    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
    }
});

// FUNCTION REMOVED: setupStaticServices was causing duplicate service loading

// Load services
async function loadServices() {
    console.log('🎨 Cargando servicios sincronizados con página principal...');
    
    const serviceSelection = document.getElementById('serviceSelection');
    
    // Service images are now managed centrally in service-images.js
    console.log('📸 Using centralized service image configuration for reservations');
    
    try {
        // Show loading state
        showLoadingReservation(serviceSelection, 'Cargando servicios...', 'Sincronizando con imágenes centralizadas');
        
        // FORCE: Always try to load from database with centralized images
        let services = null;
        
        try {
            services = await Promise.race([
                db.getServices(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            console.log('📊 Servicios de base de datos:', services);
        } catch (dbError) {
            console.log('⚠️ Base de datos no disponible, usando servicios estáticos');
        }
        
        // If database fails or is empty, use static services with centralized images
        if (!services || services.length === 0) {
            console.log('🔄 Usando servicios estáticos con sistema centralizado');
            services = await getStaticServicesWithCentralizedImages();
        } else {
            // Add centralized images to database services
            services = await Promise.all(
                services.map(async service => ({
                    ...service,
                    image_url: await getServiceImageWithFallback(service.name)
                }))
            );
        }
        
        if (services && services.length > 0) {
            console.log('✅ Usando servicios sincronizados:', services);
            
            serviceSelection.innerHTML = services.map((service, index) => {
                // CRITICAL: Use dynamic duration from Supabase
                const duration = service.duration_minutes || 15; // fallback to 15 if missing
                return `
                    <div class="service-card-reservation" data-service-id="${service.id}" data-duration="${duration}" style="animation-delay: ${index * 0.1}s">
                        <img src="${service.image_url}" alt="${service.name}" class="service-image" loading="lazy">
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <div class="service-price">$${service.price.toLocaleString()}</div>
                        <div class="service-duration" style="font-size: 0.9rem; color: #b8b8b8; margin-top: 0.5rem;">
                            ⏱️ ${duration} minutos
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add click handlers for service selection
            serviceSelection.querySelectorAll('.service-card-reservation').forEach(card => {
                card.addEventListener('click', () => selectService(card, services));
            });
            
        } else {
            console.log('📋 No hay servicios disponibles');
        }
        
    } catch (error) {
        console.error('❌ Error loading services:', error);
        console.log('🔄 FALLBACK: Usando servicios estáticos con sistema centralizado');
        
        // Final fallback with centralized images
        const fallbackServices = await getStaticServicesWithCentralizedImages();
        if (fallbackServices && fallbackServices.length > 0) {
            serviceSelection.innerHTML = fallbackServices.map((service, index) => {
                const duration = service.duration_minutes || 15;
                return `
                    <div class="service-card-reservation" data-service-id="${service.id}" data-duration="${duration}" style="animation-delay: ${index * 0.1}s">
                        <img src="${service.image_url}" alt="${service.name}" class="service-image" loading="lazy">
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <div class="service-price">$${service.price.toLocaleString()}</div>
                        <div class="service-duration" style="font-size: 0.9rem; color: #b8b8b8; margin-top: 0.5rem;">
                            ⏱️ ${duration} minutos
                        </div>
                    </div>
                `;
            }).join('');
            
            serviceSelection.querySelectorAll('.service-card-reservation').forEach(card => {
                card.addEventListener('click', () => selectService(card, fallbackServices));
            });
        }
    }
}

// GET STATIC SERVICES WITH CENTRALIZED IMAGES - SINGLE SOURCE OF TRUTH
async function getStaticServicesWithCentralizedImages() {
    console.log('📋 Generando servicios estáticos con sistema centralizado de imágenes');
    
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
    
    // Add centralized images with fallback - GUARANTEED SYNC
    const staticServices = await Promise.all(
        staticServicesBase.map(async service => ({
            ...service,
            image_url: await getServiceImageWithFallback(service.name)
        }))
    );
    
    console.log('✅ Servicios estáticos con imágenes centralizadas generados:', staticServices);
    return staticServices;
}

// Loading state utilities for reservation
function showLoadingReservation(container, title = 'Cargando...', subtitle = '') {
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">${title}</div>
            ${subtitle ? `<div class="loading-subtitle">${subtitle}</div>` : ''}
        </div>
    `;
}

function showLoadingButton(button, loadingText = 'Cargando...') {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.classList.add('loading');
}

function hideLoadingButton(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
    button.classList.remove('loading');
}

// Load barbers - FORCE IMAGES ALWAYS
async function loadBarbers() {
    console.log('👥 FORZANDO carga de barberos con fotos...');
    
    const barberSelection = document.getElementById('barberSelection');
    if (!barberSelection) {
        console.error('❌ ERROR: Elemento barberSelection no encontrado en el DOM');
        return;
    }
    
    // Show loading state
    showLoadingReservation(barberSelection, 'Cargando barberos...', 'Obteniendo información de nuestros profesionales');
    
    // FORCE static barbers with photos ALWAYS
    loadStaticBarbers();
    
    // Also try database but use static as primary
    try {
        
        const barbers = await db.getBarbers();
        console.log('📊 Barberos de DB:', barbers);
        
        // If database has barbers WITH photos, use them
        const barbersWithPhotos = barbers ? barbers.filter(b => b.photo_url) : [];
        if (barbersWithPhotos.length > 0) {
            console.log('✅ Usando barberos de base de datos con fotos');
            const barbersHTML = barbersWithPhotos.map((barber, index) => `
                <div class="barber-card" data-barber-id="${barber.id}" style="animation-delay: ${index * 0.1}s">
                    <div class="barber-photo">
                        <img src="${barber.photo_url}" alt="${barber.name}" loading="lazy">
                    </div>
                    <h3>${barber.name}</h3>
                    <p>${barber.specialty}</p>
                </div>
            `).join('');
            
            barberSelection.innerHTML = barbersHTML;
            
            // Add click handlers
            const barberCards = barberSelection.querySelectorAll('.barber-card');
            barberCards.forEach(card => {
                card.addEventListener('click', () => {
                    selectBarber(card, barbersWithPhotos);
                });
            });
        }
        
    } catch (error) {
        console.error('❌ Error al cargar barberos:', error);
        console.log('✅ Usando barberos estáticos con fotos');
    }
}

// Select service
function selectService(card, services) {
    console.log('🛍️ Seleccionando servicio...');
    
    // Remove previous selection
    const allServiceCards = document.querySelectorAll('.service-card-reservation');
    console.log(`🔄 Limpiando ${allServiceCards.length} tarjetas de servicio`);
    allServiceCards.forEach(c => c.classList.remove('selected'));
    
    // Add selection to clicked card
    card.classList.add('selected');
    console.log('✅ Tarjeta seleccionada marcada');
    
    // Store selected service with dynamic duration extraction
    const serviceId = parseInt(card.dataset.serviceId);
    const cardDuration = parseInt(card.dataset.duration); // Extract duration from DOM
    
    reservationState.selectedService = services.find(s => s.id === serviceId);
    
    // CRITICAL: Ensure duration is available (from services data or DOM)
    if (reservationState.selectedService && !reservationState.selectedService.duration_minutes && cardDuration) {
        reservationState.selectedService.duration_minutes = cardDuration;
        console.log(`🔧 FIXED: Duración extraída del DOM: ${cardDuration} minutos`);
    }
    
    console.log('📊 Servicio almacenado con duración:', reservationState.selectedService);
    
    // Enable next button
    const nextButton = document.getElementById('nextStep1');
    if (nextButton) {
        nextButton.disabled = false;
        console.log('✅ Botón "Siguiente" habilitado');
    } else {
        console.error('❌ No se encontró el botón nextStep1');
    }
}

// Select barber
function selectBarber(card, barbers) {
    console.log('👤 Seleccionando barbero...');
    
    // Remove previous selection
    const allBarberCards = document.querySelectorAll('.barber-card');
    console.log(`🔄 Limpiando ${allBarberCards.length} tarjetas de barbero`);
    allBarberCards.forEach(c => c.classList.remove('selected'));
    
    // Add selection to clicked card
    card.classList.add('selected');
    console.log('✅ Tarjeta de barbero seleccionada marcada');
    
    // Store selected barber
    const barberId = parseInt(card.dataset.barberId);
    reservationState.selectedBarber = barbers.find(b => b.id === barberId);
    console.log('📊 Barbero almacenado:', reservationState.selectedBarber);
    
    // Enable next button
    const nextButton = document.getElementById('nextStep2');
    if (nextButton) {
        nextButton.disabled = false;
        console.log('✅ Botón "Siguiente Paso 2" habilitado');
    } else {
        console.error('❌ No se encontró el botón nextStep2');
    }
}

// Setup calendar
function setupCalendar() {
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();
        
        // Update month display
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
        
        // Generate calendar grid
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            dayHeader.style.textAlign = 'center';
            dayHeader.style.padding = '0.5rem';
            dayHeader.style.color = '#f6ad37';
            calendarGrid.appendChild(dayHeader);
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayDate = new Date(year, month, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Create date objects for proper comparison (without time)
            const dayDateOnly = new Date(year, month, day);
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            // Only disable dates that are actually in the past (not today)
            if (dayDateOnly < todayDateOnly) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => selectDate(dayDate));
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    // Initial render
    renderCalendar(currentMonth, currentYear);
    
    // Navigation buttons
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });
}

// Select date
function selectDate(date) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    
    // Add selection to clicked date
    event.target.classList.add('selected');
    
    // Store selected date
    reservationState.selectedDate = date;
    
    // Enable next button
    document.getElementById('nextStep3').disabled = false;
}

// Generate dynamic hours based on barber's schedule in Supabase
async function generateDynamicHours(barberId, selectedDate) {
    console.log(`🕐 Generating dynamic hours for barber ${barberId} on ${selectedDate.toDateString()}...`);
    
    try {
        // Get the day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        const dayOfWeek = selectedDate.getDay();
        console.log(`📅 Day of week: ${dayOfWeek} (${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek]})`);
        
        // Get barber schedules
        const schedules = await db.getBarberSchedules(barberId);
        
        if (!schedules || schedules.length === 0) {
            console.log(`⚠️ No schedules found for barber ${barberId}, using fallback hours`);
            return getFallbackHours();
        }
        
        // Find schedule for this specific day
        const todaySchedule = schedules.find(s => s.day_of_week === dayOfWeek && s.is_active);
        
        if (!todaySchedule) {
            console.log(`⚠️ No schedule found for barber ${barberId} on day ${dayOfWeek}, barber doesn't work this day`);
            return []; // Return empty array if barber doesn't work this day
        }
        
        console.log(`✅ Found schedule for day ${dayOfWeek}:`, todaySchedule);
        console.log(`   Morning: ${todaySchedule.morning_start} - ${todaySchedule.morning_end}`);
        console.log(`   Afternoon: ${todaySchedule.afternoon_start} - ${todaySchedule.afternoon_end}`);
        
        const hours = [];
        
        // Generate morning hours if available
        if (todaySchedule.morning_start && todaySchedule.morning_end) {
            const morningHours = generateHourSlots(
                todaySchedule.morning_start, 
                todaySchedule.morning_end
            );
            hours.push(...morningHours);
            console.log(`🌅 Generated ${morningHours.length} morning slots: ${morningHours.join(', ')}`);
        }
        
        // Generate afternoon hours if available
        if (todaySchedule.afternoon_start && todaySchedule.afternoon_end) {
            const afternoonHours = generateHourSlots(
                todaySchedule.afternoon_start, 
                todaySchedule.afternoon_end
            );
            hours.push(...afternoonHours);
            console.log(`🌆 Generated ${afternoonHours.length} afternoon slots: ${afternoonHours.join(', ')}`);
        }
        
        console.log(`🕐 Total hours generated: ${hours.length}`);
        return hours;
        
    } catch (error) {
        console.error('❌ Error generating dynamic hours:', error);
        console.log('🔄 Falling back to default hours');
        return getFallbackHours();
    }
}

// Generate 15-minute time slots between start and end time
function generateHourSlots(startTime, endTime) {
    const slots = [];
    
    // Parse start and end times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    // Convert to minutes for easier calculation
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    // Generate 15-minute slots
    for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += 15) {
        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
    }
    
    return slots;
}

// Fallback hours if Supabase fails
function getFallbackHours() {
    console.log('📋 Using fallback hours (9:00-12:00, 14:00-19:00)');
    const hours = [];
    
    // Morning hours: 9:00 - 11:45 (every 15 minutes)
    for (let hour = 9; hour < 12; hour++) {
        hours.push(`${hour.toString().padStart(2, '0')}:00`);
        hours.push(`${hour.toString().padStart(2, '0')}:15`);
        hours.push(`${hour.toString().padStart(2, '0')}:30`);
        hours.push(`${hour.toString().padStart(2, '0')}:45`);
    }
    
    // Afternoon hours: 14:00 - 18:45 (every 15 minutes)
    for (let hour = 14; hour < 19; hour++) {
        hours.push(`${hour.toString().padStart(2, '0')}:00`);
        hours.push(`${hour.toString().padStart(2, '0')}:15`);
        hours.push(`${hour.toString().padStart(2, '0')}:30`);
        hours.push(`${hour.toString().padStart(2, '0')}:45`);
    }
    
    return hours;
}

// Filter hours for same-day reservations with 30-minute buffer
function filterHoursForSameDay(hours, selectedDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    // If selected date is not today, return all hours
    if (selectedDateOnly.getTime() !== today.getTime()) {
        console.log('📅 Selected date is not today, showing all hours');
        return hours;
    }
    
    console.log(`🕐 Filtering hours for same-day reservation. Current time: ${now.toLocaleTimeString()}`);
    
    // For today, filter out past hours and add 30-minute buffer
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Add 30-minute buffer
    const bufferTime = new Date(now);
    bufferTime.setMinutes(currentMinute + 30);
    
    // Handle hour overflow (e.g., 23:45 + 30 min = 00:15 next day)
    if (bufferTime.getDate() !== now.getDate()) {
        console.log('⚠️ Buffer time overflows to next day, no same-day slots available');
        return [];
    }
    
    const minHour = bufferTime.getHours();
    const minMinute = bufferTime.getMinutes();
    
    console.log(`⏰ Current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    console.log(`⏰ Minimum time with buffer: ${minHour}:${minMinute.toString().padStart(2, '0')}`);
    
    const filteredHours = hours.filter(time => {
        const [hourStr, minuteStr] = time.split(':');
        const hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        
        // Convert to comparable time
        const timeValue = hour * 60 + minute;
        const minTimeValue = minHour * 60 + minMinute;
        
        // Check if time is after minimum required time
        const isAfterMinTime = timeValue >= minTimeValue;
        
        // Check if time is within business hours
        const isBusinessHours = (hour >= 9 && hour < 12) || (hour >= 14 && hour < 19);
        
        const isAvailable = isAfterMinTime && isBusinessHours;
        
        if (!isAfterMinTime) {
            console.log(`❌ ${time} - Too early (minimum: ${minHour}:${minMinute.toString().padStart(2, '0')})`);
        } else if (!isBusinessHours) {
            console.log(`❌ ${time} - Outside business hours`);
        } else {
            console.log(`✅ ${time} - Available`);
        }
        
        return isAvailable;
    });
    
    console.log(`⏰ Filtered ${hours.length} hours down to ${filteredHours.length} available hours`);
    return filteredHours;
}

// Load available hours
async function loadAvailableHours() {
    const hoursSelection = document.getElementById('hoursSelection');
    const selectedDate = reservationState.selectedDate;
    const selectedBarber = reservationState.selectedBarber;
    const selectedService = reservationState.selectedService;
    
    // Update display info
    document.getElementById('selectedDateDisplay').textContent = selectedDate.toLocaleDateString('es-ES');
    document.getElementById('selectedBarberDisplay').textContent = selectedBarber.name;
    document.getElementById('selectedServiceDisplay').textContent = selectedService.name;
    
    // Show loading state for hours
    showLoadingReservation(hoursSelection, 'Verificando disponibilidad...', `Revisando horarios para ${selectedService.name}`);
    
    // Get DYNAMIC hours from Supabase based on barber's schedule for this day
    const hours = await generateDynamicHours(selectedBarber.id, selectedDate);
    
    // Filter hours for same-day reservations with 30-minute buffer
    const filteredHours = filterHoursForSameDay(hours, selectedDate);
    console.log(`⏰ Hours after same-day filtering: ${filteredHours.length}/${hours.length}`);
    
    try {
        // Check availability for each hour - CRITICAL: Use new slot-aware function
        console.log(`🔍 CHECKING AVAILABILITY: Service "${selectedService.name}" duration: ${selectedService.duration_minutes} minutes`);
        
        const availabilityChecks = await Promise.all(
            filteredHours.map(async (time) => {
                // CRITICAL: Use areAllSlotsAvailable to check if ALL required slots are free
                const isAvailable = await db.areAllSlotsAvailable(
                    selectedBarber.id,
                    selectedDate.toISOString().split('T')[0],
                    time,
                    selectedService.duration_minutes
                );
                console.log(`⏰ Slot ${time} for ${selectedService.duration_minutes}min service: ${isAvailable ? '✅' : '❌'}`);
                return { time, isAvailable };
            })
        );
        
        // Render hour buttons
        hoursSelection.innerHTML = availabilityChecks.map(({ time, isAvailable }) => `
            <button class="hour-button" ${!isAvailable ? 'disabled' : ''} data-time="${time}">
                ${time}
            </button>
        `).join('');
        
        // Add click handlers for available hours
        hoursSelection.querySelectorAll('.hour-button:not([disabled])').forEach(button => {
            button.addEventListener('click', () => selectTime(button));
        });
    } catch (error) {
        console.error('Error loading available hours:', error);
        // Fallback to basic hours (still filtered for same-day)
        hoursSelection.innerHTML = filteredHours.map(time => `
            <button class="hour-button" data-time="${time}">${time}</button>
        `).join('');
        
        hoursSelection.querySelectorAll('.hour-button').forEach(button => {
            button.addEventListener('click', () => selectTime(button));
        });
    }
    
    // Show message if no hours available
    if (filteredHours.length === 0) {
        hoursSelection.innerHTML = `
            <div class="no-hours-message">
                <p>😔 No hay horarios disponibles para hoy</p>
                <p>Por favor selecciona otra fecha</p>
            </div>
        `;
    }
}

// Select time
function selectTime(button) {
    // Remove previous selection
    document.querySelectorAll('.hour-button').forEach(b => b.classList.remove('selected'));
    
    // Add selection to clicked button
    button.classList.add('selected');
    
    // Store selected time
    reservationState.selectedTime = button.dataset.time;
    
    // Enable next button
    document.getElementById('nextStep4').disabled = false;
}

// Setup navigation
function setupNavigation() {
    console.log('🧭 Configurando navegación de pasos...');
    
    // Step 1 navigation
    const nextStep1 = document.getElementById('nextStep1');
    if (nextStep1) {
        nextStep1.addEventListener('click', () => {
            console.log('🖱️ Click en Siguiente Paso 1');
            goToStep(2);
        });
        console.log('✅ Listener configurado para nextStep1');
    } else {
        console.error('❌ No se encontró el botón nextStep1');
    }
    
    // Step 2 navigation
    const prevStep2 = document.getElementById('prevStep2');
    const nextStep2 = document.getElementById('nextStep2');
    
    if (prevStep2) {
        prevStep2.addEventListener('click', () => {
            console.log('🖱️ Click en Anterior Paso 2');
            goToStep(1);
        });
        console.log('✅ Listener configurado para prevStep2');
    }
    
    if (nextStep2) {
        nextStep2.addEventListener('click', () => {
            console.log('🖱️ Click en Siguiente Paso 2');
            goToStep(3);
        });
        console.log('✅ Listener configurado para nextStep2');
    }
    
    // Step 3 navigation
    const prevStep3 = document.getElementById('prevStep3');
    const nextStep3 = document.getElementById('nextStep3');
    
    if (prevStep3) {
        prevStep3.addEventListener('click', () => {
            console.log('🖱️ Click en Anterior Paso 3');
            goToStep(2);
        });
    }
    
    if (nextStep3) {
        nextStep3.addEventListener('click', () => {
            console.log('🖱️ Click en Siguiente Paso 3');
            goToStep(4);
            loadAvailableHours();
        });
    }
    
    // Step 4 navigation
    const prevStep4 = document.getElementById('prevStep4');
    const nextStep4 = document.getElementById('nextStep4');
    
    if (prevStep4) {
        prevStep4.addEventListener('click', () => {
            console.log('🖱️ Click en Anterior Paso 4');
            goToStep(3);
        });
    }
    
    if (nextStep4) {
        nextStep4.addEventListener('click', () => {
            console.log('🖱️ Click en Siguiente Paso 4');
            goToStep(5);
        });
    }
    
    // Step 5 navigation
    const prevStep5 = document.getElementById('prevStep5');
    const nextStep5 = document.getElementById('nextStep5');
    
    if (prevStep5) {
        prevStep5.addEventListener('click', () => {
            console.log('🖱️ Click en Anterior Paso 5');
            goToStep(4);
        });
    }
    
    if (nextStep5) {
        nextStep5.addEventListener('click', () => {
            console.log('🖱️ Click en Siguiente Paso 5');
            if (validateForm()) {
                updateConfirmationSummary();
                goToStep(6);
            }
        });
    }
    
    // Step 6 navigation
    const prevStep6 = document.getElementById('prevStep6');
    const confirmBtn = document.getElementById('confirmReservation');
    const newReservationBtn = document.getElementById('newReservation');
    
    if (prevStep6) {
        prevStep6.addEventListener('click', () => {
            console.log('🖱️ Click en Anterior Paso 6');
            goToStep(5);
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            console.log('🖱️ Click en Confirmar Reserva');
            confirmReservation();
        });
    }
    
    if (newReservationBtn) {
        newReservationBtn.addEventListener('click', () => {
            console.log('🖱️ Click en Nueva Reserva');
            resetReservation();
        });
    }
    
    console.log('✅ Navegación configurada completamente');
}

// Go to step
function goToStep(step) {
    console.log(`🚀 Navegando al paso ${step}...`);
    
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-container');
    console.log(`🔍 Encontrados ${allSteps.length} contenedores de paso`);
    
    allSteps.forEach((container, index) => {
        console.log(`📦 Ocultando paso ${index + 1}: ${container.dataset.step}`);
        container.classList.remove('active');
    });
    
    // Show target step - ESPECÍFICAMENTE el contenedor del paso, NO el indicador de progreso
    const targetStep = document.querySelector(`.step-container[data-step="${step}"]`);
    console.log(`🎯 CONTENEDOR del paso encontrado:`, targetStep);
    
    // Debug: Mostrar TODOS los elementos con este data-step
    const allStepElements = document.querySelectorAll(`[data-step="${step}"]`);
    console.log(`🔍 TODOS los elementos con data-step="${step}":`, allStepElements);
    allStepElements.forEach((el, index) => {
        console.log(`   ${index + 1}. ${el.className} - ${el.tagName}`);
    });
    
    if (!targetStep) {
        console.error(`❌ ERROR: No se encontró el CONTENEDOR del paso ${step}`);
        return;
    }
    
    // Verificar que sea efectivamente un step-container
    if (!targetStep.classList.contains('step-container')) {
        console.error(`❌ ERROR: El elemento encontrado NO es un step-container: ${targetStep.className}`);
        return;
    }
    
    targetStep.classList.add('active');
    console.log(`✅ CONTENEDOR del paso ${step} activado`);
    console.log(`🏷️ Clases del contenedor:`, targetStep.classList.toString());
    
    // Debug CSS styles del CONTENEDOR
    const computedStyles = window.getComputedStyle(targetStep);
    console.log(`🎨 CSS Debug - Display: ${computedStyles.display}`);
    console.log(`🎨 CSS Debug - Visibility: ${computedStyles.visibility}`);
    console.log(`🎨 CSS Debug - Opacity: ${computedStyles.opacity}`);
    console.log(`🎨 CSS Debug - Position: ${computedStyles.position}`);
    console.log(`🎨 CSS Debug - Z-Index: ${computedStyles.zIndex}`);
    
    // Verificar que el contenedor tenga contenido
    const containerContent = targetStep.innerHTML;
    console.log(`📄 Contenido del contenedor (primeros 100 chars):`, containerContent.substring(0, 100) + '...');
    
    // Para el paso 2, verificar específicamente que el barberSelection esté presente
    if (step === 2) {
        const barberSelectionContainer = targetStep.querySelector('#barberSelection');
        console.log(`👥 Contenedor barberSelection encontrado en paso 2:`, barberSelectionContainer);
        if (barberSelectionContainer) {
            console.log(`👥 Contenido de barberSelection:`, barberSelectionContainer.innerHTML.length > 0 ? 'SÍ HAY CONTENIDO' : 'VACÍO');
        }
    }
    
    // Update progress indicator - only for progress indicators, not step containers
    const progressIndicators = document.querySelectorAll('.progress-step');
    console.log(`🔢 Encontrados ${progressIndicators.length} indicadores de progreso`);
    
    progressIndicators.forEach(indicator => {
        indicator.classList.remove('active', 'completed');
    });
    
    // Mark previous steps as completed (ONLY progress indicators, NOT step containers)
    for (let i = 1; i < step; i++) {
        const progressIndicator = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (progressIndicator) {
            progressIndicator.classList.add('completed');
            console.log(`✓ Indicador ${i} marcado como completado`);
        }
    }
    
    // Mark current step as active in progress indicator (ONLY progress indicators, NOT step containers)
    const currentProgressIndicator = document.querySelector(`.progress-step[data-step="${step}"]`);
    if (currentProgressIndicator) {
        currentProgressIndicator.classList.add('active');
        console.log(`🔥 Indicador ${step} marcado como activo`);
    }
    
    // Update current step
    reservationState.currentStep = step;
    console.log(`📊 Estado actualizado - paso actual: ${step}`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log(`✅ Navegación al paso ${step} completada`);
}

// Global form validation function
function validateForm() {
    console.log('📋 Validando formulario...');
    
    // Obtener datos del formulario
    const nameInput = document.getElementById('customerName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const observationsInput = document.getElementById('observations');
    
    if (!nameInput || !emailInput || !phoneInput) {
        console.error('❌ No se encontraron los campos del formulario');
        return false;
    }
    
    const name = nameInput.value?.trim();
    const email = emailInput.value?.trim();
    const phone = phoneInput.value?.trim();
    const observations = observationsInput?.value?.trim() || '';
    
    console.log('👤 Nombre:', name);
    console.log('📧 Email:', email);
    console.log('📞 Teléfono:', phone);
    console.log('📝 Observaciones:', observations);
    
    // Validar nombre
    if (!name) {
        alert('Por favor ingresa tu nombre completo');
        nameInput.focus();
        return false;
    }
    
    if (name.length < 2) {
        alert('El nombre debe tener al menos 2 caracteres');
        nameInput.focus();
        return false;
    }
    
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name)) {
        alert('El nombre solo puede contener letras y espacios');
        nameInput.focus();
        return false;
    }
    
    // Validar email
    if (!email) {
        alert('Por favor ingresa tu email');
        emailInput.focus();
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor ingresa un email válido');
        emailInput.focus();
        return false;
    }
    
    // Validar teléfono
    if (!phone) {
        alert('Por favor ingresa tu teléfono');
        phoneInput.focus();
        return false;
    }
    
    // Validar formato de teléfono argentino
    const phoneRegex = /^(\+54|54)?[\s\-]?([0-9]{2,4})[\s\-]?[0-9]{6,8}$/;
    if (!phoneRegex.test(phone)) {
        alert('Por favor ingresa un teléfono válido (formato argentino)');
        phoneInput.focus();
        return false;
    }
    
    console.log('✅ Formulario válido');
    return true;
}

// Setup form validation
function setupFormValidation() {
    const nameInput = document.getElementById('customerName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const nextStep5 = document.getElementById('nextStep5');
    
    if (!nameInput || !emailInput || !phoneInput || !nextStep5) {
        console.warn('⚠️ No se encontraron todos los elementos del formulario');
        return;
    }
    
    function updateButtonState() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        
        const nameValid = name.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const phoneValid = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
        
        nextStep5.disabled = !(nameValid && emailValid && phoneValid);
        
        return nameValid && emailValid && phoneValid;
    }
    
    nameInput.addEventListener('input', updateButtonState);
    emailInput.addEventListener('input', updateButtonState);
    phoneInput.addEventListener('input', updateButtonState);
    
    // Initial validation
    updateButtonState();
}

// Setup form auto-focus and real-time validation
function setupFormAutoFocus() {
    const inputs = ['customerName', 'email', 'phone'];
    
    inputs.forEach((inputId, index) => {
        const input = document.getElementById(inputId);
        if (input) {
            // Auto-focus next field on Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const nextIndex = index + 1;
                    if (nextIndex < inputs.length) {
                        const nextInput = document.getElementById(inputs[nextIndex]);
                        if (nextInput) {
                            nextInput.focus();
                        }
                    } else {
                        // Last field, try to submit if valid
                        if (validateForm()) {
                            updateConfirmationSummary();
                            goToStep(6);
                        }
                    }
                }
            });
        }
    });
}

// Update confirmation summary
function updateConfirmationSummary() {
    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        observations: document.getElementById('observations').value
    };
    
    reservationState.customerData = customerData;
    
    // Update confirmation display
    document.getElementById('confirmName').textContent = customerData.name;
    document.getElementById('confirmService').textContent = reservationState.selectedService.name;
    document.getElementById('confirmPrice').textContent = reservationState.selectedService.price.toLocaleString();
    document.getElementById('confirmBarber').textContent = reservationState.selectedBarber.name;
    document.getElementById('confirmDate').textContent = reservationState.selectedDate.toLocaleDateString('es-ES');
    document.getElementById('confirmTime').textContent = reservationState.selectedTime;
    document.getElementById('confirmEmail').textContent = customerData.email;
    document.getElementById('confirmPhone').textContent = customerData.phone;
    document.getElementById('confirmObservations').textContent = customerData.observations || 'Ninguna';
}

// Confirm reservation
async function confirmReservation() {
    try {
        console.log('🔄 Confirmando reserva...');
        
        // Show loading state
        const confirmBtn = document.getElementById('confirmReservation');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Confirmando...';
        confirmBtn.disabled = true;
        
        const appointmentData = {
            customer_name: reservationState.customerData.name,
            email: reservationState.customerData.email,
            phone: reservationState.customerData.phone,
            observations: reservationState.customerData.observations,
            appointment_date: reservationState.selectedDate.toISOString().split('T')[0],
            appointment_time: reservationState.selectedTime,
            barber_id: reservationState.selectedBarber.id,
            service_type: reservationState.selectedService.name,
            service_price: reservationState.selectedService.price,
            status: 'confirmado'
        };
        
        console.log('📝 Datos de la cita:', appointmentData);
        
        const result = await db.createAppointment(appointmentData);
        console.log('✅ Reserva creada:', result);
        
        // Update success screen with all details
        document.getElementById('reservationNumber').textContent = `BC-${result[0].id.toString().padStart(4, '0')}`;
        document.getElementById('successName').textContent = appointmentData.customer_name;
        document.getElementById('successService').textContent = appointmentData.service_type;
        document.getElementById('successBarber').textContent = reservationState.selectedBarber.name;
        document.getElementById('successDate').textContent = reservationState.selectedDate.toLocaleDateString('es-ES');
        document.getElementById('successTime').textContent = appointmentData.appointment_time;
        document.getElementById('successPrice').textContent = appointmentData.service_price.toLocaleString();
        document.getElementById('successEmail').textContent = appointmentData.email;
        document.getElementById('successPhone').textContent = appointmentData.phone;
        document.getElementById('successObservations').textContent = appointmentData.observations || 'Ninguna';
        
        // Hide all steps and show success
        document.querySelectorAll('.step-container').forEach(container => {
            container.classList.remove('active');
            container.style.display = 'none';
        });
        
        const successStep = document.querySelector('[data-step="success"]');
        successStep.style.display = 'block';
        successStep.classList.add('active');
        
        // Update progress indicator
        document.querySelectorAll('.progress-step').forEach(indicator => {
            indicator.classList.add('completed');
        });
        
        console.log('🎉 Reserva confirmada exitosamente');
        
    } catch (error) {
        console.error('Error creating reservation:', error);
        alert('Error al confirmar la reserva. Por favor, inténtalo de nuevo.');
    }
}

// Reset reservation
function resetReservation() {
    reservationState = {
        currentStep: 1,
        selectedService: null,
        selectedBarber: null,
        selectedDate: null,
        selectedTime: null,
        customerData: {}
    };
    
    // Reset form
    document.getElementById('customerForm').reset();
    
    // Remove selections
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    
    // Hide success and show step 1
    document.querySelector('[data-step="success"]').style.display = 'none';
    goToStep(1);
}

// FUNCTION REMOVED: loadStaticServicesReservation replaced by getStaticServicesWithCentralizedImages

function loadStaticBarbers() {
    console.log('🔄 FALLBACK: Cargando barberos estáticos...');
    
    const barberSelection = document.getElementById('barberSelection');
    
    if (!barberSelection) {
        console.error('❌ FALLBACK ERROR: Elemento barberSelection no encontrado');
        return;
    }
    
    const staticBarbers = [
        { 
            id: 1, 
            name: "Héctor Medina", 
            specialty: "Especialista en cortes clásicos y arreglo de barba tradicional. 15 años de experiencia.", 
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
        },
        { 
            id: 2, 
            name: "Lucas Peralta", 
            specialty: "Experto en estilos modernos, degradados y tendencias actuales. Especializado en jóvenes.", 
            photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
        },
        { 
            id: 3, 
            name: "Camila González", 
            specialty: "Especialista en tratamientos capilares, coloración y cuidado integral del cabello.", 
            photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face'
        }
    ];
    
    console.log('📊 Barberos estáticos:', staticBarbers);
    
    const barbersHTML = staticBarbers.map(barber => `
        <div class="barber-card" data-barber-id="${barber.id}">
            <div class="barber-photo">
                ${barber.photo_url ? `<img src="${barber.photo_url}" alt="${barber.name}">` : barber.name.charAt(0)}
            </div>
            <h3>${barber.name}</h3>
            <p>${barber.specialty}</p>
        </div>
    `).join('');
    
    console.log('📝 HTML estático generado:', barbersHTML);
    barberSelection.innerHTML = barbersHTML;
    console.log('✅ HTML estático insertado');
    
    const barberCards = barberSelection.querySelectorAll('.barber-card');
    console.log('🎯 Tarjetas estáticas encontradas:', barberCards.length);
    
    barberCards.forEach((card, index) => {
        console.log(`🔧 Configurando listener estático para tarjeta ${index + 1}`);
        card.addEventListener('click', () => {
            console.log(`🖱️ Click en barbero estático: ${card.dataset.barberId}`);
            selectBarber(card, staticBarbers);
        });
    });
    
    console.log('✅ Barberos estáticos cargados exitosamente');
}