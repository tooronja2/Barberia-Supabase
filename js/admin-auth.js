// Admin Authentication Module
import { supabase } from './supabase.js';

// Authentication functions
export const adminAuth = {
  // Login barber
  async loginBarber(email, password) {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }
      
      // Get barber data by email
      const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
        
      if (barberError || !barber) {
        console.error('❌ Barber not found:', barberError);
        throw new Error('Barbero no encontrado o inactivo');
      }
      
      console.log('✅ Login successful:', { user: data.user, barber });
      return { user: data.user, barber };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  async checkAuth() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('❌ User not authenticated');
        return null;
      }
      
      // Get barber data
      const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single();
        
      if (barberError || !barber) {
        console.error('❌ Barber not found for user:', user.email);
        return null;
      }
      
      console.log('✅ User authenticated:', { user, barber });
      return { user, barber };
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return null;
    }
  },

  // Logout
  async logout() {
    try {
      console.log('🔐 Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }
};

// DOM elements and event listeners for login page
document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're on the login page
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    initializeLogin();
  }
  
  // Check if we're on the admin panel page
  const adminPanel = document.querySelector('.admin-panel-body');
  if (adminPanel) {
    await initializeAdminPanel();
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
  
  if (event === 'SIGNED_OUT' && window.location.pathname.includes('admin-panel')) {
    window.location.href = 'admin-login.html';
  }
});

// Initialize login page
function initializeLogin() {
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('loginButton');
  const errorMessage = document.getElementById('errorMessage');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    loginButton.disabled = true;
    document.querySelector('.button-text').style.display = 'none';
    document.querySelector('.loading-spinner').style.display = 'block';
    errorMessage.style.display = 'none';
    
    try {
      const { user, barber } = await adminAuth.loginBarber(email, password);
      
      // Store barber data in session
      sessionStorage.setItem('currentBarber', JSON.stringify(barber));
      
      // Redirect to admin panel
      window.location.href = 'admin-panel.html';
      
    } catch (error) {
      // Show error message
      errorMessage.textContent = error.message || 'Error al iniciar sesión';
      errorMessage.style.display = 'block';
      
      // Reset button state
      loginButton.disabled = false;
      document.querySelector('.button-text').style.display = 'block';
      document.querySelector('.loading-spinner').style.display = 'none';
    }
  });
}

// Initialize admin panel (auth check)
async function initializeAdminPanel() {
  const authData = await adminAuth.checkAuth();
  
  if (!authData) {
    // Redirect to login if not authenticated
    window.location.href = 'admin-login.html';
    return;
  }
  
  // Store barber data in session
  sessionStorage.setItem('currentBarber', JSON.stringify(authData.barber));
  
  // Update welcome message
  const welcomeMessage = document.getElementById('welcomeMessage');
  if (welcomeMessage) {
    welcomeMessage.textContent = `Bienvenido, ${authData.barber.name}`;
  }
  
  // Setup logout button
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await adminAuth.logout();
        sessionStorage.removeItem('currentBarber');
        window.location.href = 'admin-login.html';
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }
}

// Utility function to get current barber
export function getCurrentBarber() {
  const barberData = sessionStorage.getItem('currentBarber');
  return barberData ? JSON.parse(barberData) : null;
}