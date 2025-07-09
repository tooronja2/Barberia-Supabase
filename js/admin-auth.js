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
    // Try auto-login first for PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      const autoLoginSuccess = await attemptAutoLogin();
      if (autoLoginSuccess) {
        window.location.href = 'admin-panel.html';
        return;
      }
    }
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
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('rememberMe');
  
  // Load saved credentials
  loadSavedCredentials();
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberCheckbox.checked;
    
    // Show loading state
    loginButton.disabled = true;
    document.querySelector('.button-text').style.display = 'none';
    document.querySelector('.loading-spinner').style.display = 'block';
    errorMessage.style.display = 'none';
    
    try {
      const { user, barber } = await adminAuth.loginBarber(email, password);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        saveCredentials(email, password, barber);
      } else {
        clearSavedCredentials();
      }
      
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
        clearSavedCredentials();
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

// Credential management functions
function saveCredentials(email, password, barber) {
  try {
    const credentials = {
      email: email,
      password: password,
      barber: barber,
      timestamp: Date.now()
    };
    
    // Encrypt the credentials (simple base64 encoding)
    const encryptedCredentials = btoa(JSON.stringify(credentials));
    localStorage.setItem('adminCredentials', encryptedCredentials);
    
    console.log('✅ Credentials saved successfully');
  } catch (error) {
    console.error('❌ Error saving credentials:', error);
  }
}

function loadSavedCredentials() {
  try {
    const encryptedCredentials = localStorage.getItem('adminCredentials');
    if (!encryptedCredentials) return;
    
    const credentials = JSON.parse(atob(encryptedCredentials));
    
    // Check if credentials are not too old (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - credentials.timestamp > thirtyDaysInMs) {
      clearSavedCredentials();
      return;
    }
    
    // Auto-fill the form
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('rememberMe');
    
    if (emailInput && passwordInput && rememberCheckbox) {
      emailInput.value = credentials.email;
      passwordInput.value = credentials.password;
      rememberCheckbox.checked = true;
    }
    
    console.log('✅ Credentials loaded successfully');
  } catch (error) {
    console.error('❌ Error loading credentials:', error);
    clearSavedCredentials();
  }
}

function clearSavedCredentials() {
  try {
    localStorage.removeItem('adminCredentials');
    console.log('✅ Credentials cleared');
  } catch (error) {
    console.error('❌ Error clearing credentials:', error);
  }
}

// Auto-login function for PWA
async function attemptAutoLogin() {
  try {
    const encryptedCredentials = localStorage.getItem('adminCredentials');
    if (!encryptedCredentials) return false;
    
    const credentials = JSON.parse(atob(encryptedCredentials));
    
    // Check if credentials are not too old (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - credentials.timestamp > thirtyDaysInMs) {
      clearSavedCredentials();
      return false;
    }
    
    // Try to login with saved credentials
    const { user, barber } = await adminAuth.loginBarber(credentials.email, credentials.password);
    
    // Store barber data in session
    sessionStorage.setItem('currentBarber', JSON.stringify(barber));
    
    console.log('✅ Auto-login successful');
    return true;
  } catch (error) {
    console.error('❌ Auto-login failed:', error);
    clearSavedCredentials();
    return false;
  }
}