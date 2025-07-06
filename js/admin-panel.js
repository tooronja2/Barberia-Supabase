// Admin Panel Module
import { supabase } from './supabase.js';
import { adminAuth, getCurrentBarber } from './admin-auth.js';

// Panel functions
export const adminPanel = {
  // Get appointments for specific barber
  async getBarberAppointments(barberId, date = null) {
    try {
      console.log('📅 Getting appointments for barber:', barberId, 'date:', date);
      
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .order('appointment_time', { ascending: true });
        
      if (date) {
        query = query.eq('appointment_date', date);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error getting appointments:', error);
        throw error;
      }
      
      console.log('✅ Appointments retrieved:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to get appointments:', error);
      throw error;
    }
  },

  // Get barber statistics
  async getBarberStats(barberId, date) {
    try {
      console.log('📊 Getting stats for barber:', barberId, 'date:', date);
      
      const appointments = await this.getBarberAppointments(barberId, date);
      
      const stats = {
        confirmed: appointments.filter(a => a.status === 'confirmado').length,
        cancelled: appointments.filter(a => a.status === 'cancelado').length,
        revenue: appointments
          .filter(a => a.status === 'confirmado')
          .reduce((sum, a) => sum + (parseFloat(a.service_price) || 0), 0)
      };
      
      console.log('✅ Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      throw error;
    }
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId, newStatus) {
    try {
      console.log('📝 Updating appointment status:', appointmentId, 'to:', newStatus);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .select();
        
      if (error) {
        console.error('❌ Error updating appointment:', error);
        throw error;
      }
      
      console.log('✅ Appointment updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to update appointment:', error);
      throw error;
    }
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  },

  // Format date
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-AR');
  },

  // Format time
  formatTime(timeString) {
    return timeString.slice(0, 5); // Remove seconds
  }
};

// DOM management
let currentBarber = null;
let selectedAppointment = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initializePanel();
});

async function initializePanel() {
  // Get current barber
  currentBarber = getCurrentBarber();
  
  if (!currentBarber) {
    console.log('❌ No barber data found, redirecting to login');
    window.location.href = 'admin-login.html';
    return;
  }
  
  console.log('✅ Current barber:', currentBarber);
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateFilter').value = today;
  
  // Load initial data
  await loadDashboardData();
  
  // Setup event listeners
  setupEventListeners();
}

function setupEventListeners() {
  // Date filter change
  document.getElementById('dateFilter').addEventListener('change', async () => {
    await loadDashboardData();
  });
  
  // Refresh button
  document.getElementById('refreshButton').addEventListener('click', async () => {
    await loadDashboardData();
  });
  
  // Modal close
  document.getElementById('modalClose').addEventListener('click', () => {
    closeModal();
  });
  
  // Modal buttons
  document.getElementById('confirmAppointmentBtn').addEventListener('click', async () => {
    await updateAppointmentStatus('confirmado');
  });
  
  document.getElementById('cancelAppointmentBtn').addEventListener('click', async () => {
    await updateAppointmentStatus('cancelado');
  });
}

async function loadDashboardData() {
  const selectedDate = document.getElementById('dateFilter').value;
  
  try {
    // Show loading
    showLoadingState();
    
    // Get appointments and stats
    const [appointments, stats] = await Promise.all([
      adminPanel.getBarberAppointments(currentBarber.id, selectedDate),
      adminPanel.getBarberStats(currentBarber.id, selectedDate)
    ]);
    
    // Update stats
    updateStatsDisplay(stats);
    
    // Update appointments table
    updateAppointmentsTable(appointments);
    
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
    showErrorMessage('Error al cargar los datos del dashboard');
  }
}

function updateStatsDisplay(stats) {
  document.getElementById('confirmedCount').textContent = stats.confirmed;
  document.getElementById('cancelledCount').textContent = stats.cancelled;
  document.getElementById('revenueAmount').textContent = adminPanel.formatCurrency(stats.revenue);
}

function updateAppointmentsTable(appointments) {
  const tbody = document.getElementById('appointmentsTableBody');
  const noAppointments = document.getElementById('noAppointments');
  
  // Clear loading row
  tbody.innerHTML = '';
  
  if (appointments.length === 0) {
    noAppointments.style.display = 'block';
    return;
  }
  
  noAppointments.style.display = 'none';
  
  appointments.forEach(appointment => {
    const row = createAppointmentRow(appointment);
    tbody.appendChild(row);
  });
}

function createAppointmentRow(appointment) {
  const row = document.createElement('tr');
  row.className = `appointment-row status-${appointment.status}`;
  
  // Extract client name from email (before @)
  const clientName = appointment.email.split('@')[0];
  
  row.innerHTML = `
    <td>${adminPanel.formatTime(appointment.appointment_time)}</td>
    <td>${clientName}</td>
    <td>${appointment.service_type}</td>
    <td>${adminPanel.formatCurrency(appointment.service_price)}</td>
    <td>
      <span class="status-badge status-${appointment.status}">
        ${appointment.status}
      </span>
    </td>
    <td>
      <button class="btn btn-sm btn-info" onclick="viewAppointment(${appointment.id})">
        Ver
      </button>
    </td>
  `;
  
  return row;
}

// Global function to view appointment details
window.viewAppointment = async (appointmentId) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
      
    if (error) throw error;
    
    selectedAppointment = data;
    showAppointmentModal(data);
  } catch (error) {
    console.error('❌ Error loading appointment:', error);
    showErrorMessage('Error al cargar los detalles del turno');
  }
};

function showAppointmentModal(appointment) {
  // Populate modal fields
  document.getElementById('modalClientName').textContent = appointment.email.split('@')[0];
  document.getElementById('modalClientEmail').textContent = appointment.email;
  document.getElementById('modalClientPhone').textContent = appointment.phone;
  document.getElementById('modalDate').textContent = adminPanel.formatDate(appointment.appointment_date);
  document.getElementById('modalTime').textContent = adminPanel.formatTime(appointment.appointment_time);
  document.getElementById('modalService').textContent = appointment.service_type;
  document.getElementById('modalPrice').textContent = adminPanel.formatCurrency(appointment.service_price);
  document.getElementById('modalStatus').textContent = appointment.status;
  document.getElementById('modalObservations').textContent = appointment.observations || 'Sin observaciones';
  
  // Show/hide action buttons based on status
  const confirmBtn = document.getElementById('confirmAppointmentBtn');
  const cancelBtn = document.getElementById('cancelAppointmentBtn');
  
  if (appointment.status === 'confirmado') {
    confirmBtn.style.display = 'none';
    cancelBtn.style.display = 'block';
  } else if (appointment.status === 'cancelado') {
    confirmBtn.style.display = 'block';
    cancelBtn.style.display = 'none';
  } else {
    confirmBtn.style.display = 'block';
    cancelBtn.style.display = 'block';
  }
  
  // Show modal
  document.getElementById('appointmentModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('appointmentModal').style.display = 'none';
  selectedAppointment = null;
}

async function updateAppointmentStatus(newStatus) {
  if (!selectedAppointment) return;
  
  try {
    await adminPanel.updateAppointmentStatus(selectedAppointment.id, newStatus);
    closeModal();
    await loadDashboardData(); // Refresh data
    showSuccessMessage(`Turno ${newStatus} exitosamente`);
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    showErrorMessage('Error al actualizar el turno');
  }
}

function showLoadingState() {
  const tbody = document.getElementById('appointmentsTableBody');
  tbody.innerHTML = `
    <tr id="loadingRow">
      <td colspan="6" class="loading-cell">
        <div class="loading-spinner"></div>
        Cargando turnos...
      </td>
    </tr>
  `;
}

function showErrorMessage(message) {
  // Create or update error message
  let errorDiv = document.getElementById('errorMessage');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.className = 'alert alert-error';
    document.querySelector('.admin-main').insertBefore(errorDiv, document.querySelector('.stats-section'));
  }
  
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function showSuccessMessage(message) {
  // Create or update success message
  let successDiv = document.getElementById('successMessage');
  if (!successDiv) {
    successDiv = document.createElement('div');
    successDiv.id = 'successMessage';
    successDiv.className = 'alert alert-success';
    document.querySelector('.admin-main').insertBefore(successDiv, document.querySelector('.stats-section'));
  }
  
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    successDiv.style.display = 'none';
  }, 3000);
}