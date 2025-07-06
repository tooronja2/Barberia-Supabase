// Supabase client configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://aooxkgxqdzddwfojfipd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvb3hrZ3hxZHpkZHdmb2pmaXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzU3NTgsImV4cCI6MjA2NzIxMTc1OH0.4Pp-gqb7ZCMVl7txSCM2wTxxXv1CPWZ1phCMyLUK5fQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const db = {
  // Get all barbers
  async getBarbers() {
    console.log('🔍 Ejecutando consulta de barberos...');
    console.log('📊 Supabase URL:', supabaseUrl);
    console.log('🔗 Supabase client:', supabase);
    
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true)
        .order('id')
      
      console.log('📋 Respuesta de Supabase:', { data, error });
      
      if (error) {
        console.error('❌ Error en consulta de barberos:', error);
        throw error;
      }
      
      console.log('✅ Barberos obtenidos exitosamente:', data);
      return data;
    } catch (err) {
      console.error('❌ Error catch en getBarbers:', err);
      throw err;
    }
  },

  // Get all services
  async getServices() {
    console.log('🔍 Ejecutando consulta optimizada de servicios...');
    
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('services')
          .select('id, name, description, price, duration_minutes, is_active')
          .eq('is_active', true)
          .order('id'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Consulta timeout después de 3 segundos')), 3000)
        )
      ]);
      
      console.log('📋 Respuesta de servicios:', { data, error });
      
      if (error) {
        console.error('❌ Error en consulta de servicios:', error);
        throw error;
      }
      
      console.log('✅ Servicios obtenidos exitosamente:', data);
      return data;
    } catch (err) {
      console.error('❌ Error catch en getServices:', err);
      throw err;
    }
  },

  // Get barber schedules
  async getBarberSchedules(barberId) {
    console.log(`🗓️ Getting schedules for barber ${barberId}...`);
    
    const { data, error } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barber_id', barberId)
      .eq('is_active', true)
      .order('day_of_week')
    
    if (error) {
      console.error('❌ Error getting barber schedules:', error);
      throw error;
    }
    
    console.log(`📅 Schedules for barber ${barberId}:`, data);
    if (data && data.length > 0) {
      data.forEach(schedule => {
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        console.log(`   ${dayNames[schedule.day_of_week]} (${schedule.day_of_week}): ${schedule.morning_start}-${schedule.morning_end}, ${schedule.afternoon_start}-${schedule.afternoon_end}`);
      });
    } else {
      console.log(`⚠️ No schedules found for barber ${barberId}`);
    }
    
    return data;
  },

  // Get barber days off
  async getBarberDaysOff(barberId, date) {
    const { data, error } = await supabase
      .from('barber_days_off')
      .select('*')
      .eq('barber_id', barberId)
      .eq('off_date', date)
    
    if (error) throw error
    return data
  },

  // Get appointments for a specific date and barber
  async getAppointments(barberId, date) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barberId)
      .eq('appointment_date', date)
      .eq('status', 'confirmado')
    
    if (error) throw error
    return data
  },

  // Create new appointment
  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
    
    if (error) throw error
    return data
  },

  // Generate all 15-minute time slots needed for a service
  generateRequiredTimeSlots(startTime, duration) {
    const slots = [];
    const startDate = new Date(`2000-01-01T${startTime}`);
    const slotsNeeded = Math.ceil(duration / 15); // How many 15-min slots needed
    
    for (let i = 0; i < slotsNeeded; i++) {
      const slotTime = new Date(startDate.getTime() + (i * 15 * 60000));
      const timeString = slotTime.toTimeString().slice(0, 5);
      slots.push(timeString);
    }
    
    console.log(`🔢 SLOTS REQUIRED: ${duration}min service needs slots:`, slots);
    return slots;
  },

  // Check if ALL required time slots are available for a service
  async areAllSlotsAvailable(barberId, date, startTime, duration) {
    const requiredSlots = this.generateRequiredTimeSlots(startTime, duration);
    
    console.log(`🔍 CHECKING availability for ${duration}min service starting at ${startTime}`);
    console.log(`📋 Required slots:`, requiredSlots);
    
    // Check each required slot
    for (const slot of requiredSlots) {
      const isAvailable = await this.isTimeSlotAvailable(barberId, date, slot, 15);
      console.log(`⏰ Slot ${slot}: ${isAvailable ? '✅ AVAILABLE' : '❌ OCCUPIED'}`);
      
      if (!isAvailable) {
        console.log(`❌ BLOCKED: Service cannot start at ${startTime} because slot ${slot} is occupied`);
        return false;
      }
    }
    
    console.log(`✅ ALL SLOTS AVAILABLE: Service can start at ${startTime}`);
    return true;
  },

  // Check if time slot is available (individual 15-min slot)
  async isTimeSlotAvailable(barberId, date, time, duration) {
    const appointments = await this.getAppointments(barberId, date)
    const daysOff = await this.getBarberDaysOff(barberId, date)
    
    // Check if barber has day off
    if (daysOff && daysOff.length > 0) {
      return false
    }
    
    // CRITICAL: Check if barber works on this day of week
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
    const schedules = await this.getBarberSchedules(barberId)
    
    const workingSchedule = schedules ? schedules.find(s => s.day_of_week === dayOfWeek && s.is_active) : null
    if (!workingSchedule) {
      console.log(`❌ Barber ${barberId} doesn't work on day ${dayOfWeek} (${date})`)
      return false
    }
    
    // Check if time is within working hours
    const [timeHour, timeMinute] = time.split(':').map(Number)
    const timeInMinutes = timeHour * 60 + timeMinute
    
    // Morning shift
    if (workingSchedule.morning_start && workingSchedule.morning_end) {
      const [morningStartH, morningStartM] = workingSchedule.morning_start.split(':').map(Number)
      const [morningEndH, morningEndM] = workingSchedule.morning_end.split(':').map(Number)
      const morningStartMin = morningStartH * 60 + morningStartM
      const morningEndMin = morningEndH * 60 + morningEndM
      
      if (timeInMinutes >= morningStartMin && timeInMinutes < morningEndMin) {
        // Time is within morning shift, continue with other checks
        console.log(`✅ Time ${time} is in morning shift for barber ${barberId}`)
      } else if (workingSchedule.afternoon_start && workingSchedule.afternoon_end) {
        // Check afternoon shift
        const [afternoonStartH, afternoonStartM] = workingSchedule.afternoon_start.split(':').map(Number)
        const [afternoonEndH, afternoonEndM] = workingSchedule.afternoon_end.split(':').map(Number)
        const afternoonStartMin = afternoonStartH * 60 + afternoonStartM
        const afternoonEndMin = afternoonEndH * 60 + afternoonEndM
        
        if (timeInMinutes >= afternoonStartMin && timeInMinutes < afternoonEndMin) {
          console.log(`✅ Time ${time} is in afternoon shift for barber ${barberId}`)
        } else {
          console.log(`❌ Time ${time} is outside working hours for barber ${barberId}`)
          return false
        }
      } else {
        console.log(`❌ Time ${time} is outside morning hours and no afternoon shift for barber ${barberId}`)
        return false
      }
    } else {
      console.log(`❌ No morning schedule found for barber ${barberId} on day ${dayOfWeek}`)
      return false
    }
    
    // Check for conflicting appointments
    const selectedTime = new Date(`${date}T${time}`)
    const endTime = new Date(selectedTime.getTime() + duration * 60000)
    
    for (const appointment of appointments) {
      const appointmentStart = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
      
      // Get the actual service duration from the appointment or use default
      let appointmentDuration = 60; // Default 60 minutes if not specified
      
      // Try to get duration from service info
      if (appointment.service_duration_minutes) {
        appointmentDuration = appointment.service_duration_minutes;
      } else {
        // Fallback: map service names to durations
        const serviceDurations = {
          'Corte de barba': 15,
          'Corte de pelo': 15,
          'Corte todo máquina': 15,
          'Corte de pelo y barba': 30,
          'Diseños y dibujos': 30
        };
        appointmentDuration = serviceDurations[appointment.service_type] || 60;
      }
      
      const appointmentEnd = new Date(appointmentStart.getTime() + appointmentDuration * 60000)
      
      // Check for overlap
      if (
        (selectedTime >= appointmentStart && selectedTime < appointmentEnd) ||
        (endTime > appointmentStart && endTime <= appointmentEnd) ||
        (selectedTime <= appointmentStart && endTime >= appointmentEnd)
      ) {
        return false
      }
    }
    
    return true
  }
}