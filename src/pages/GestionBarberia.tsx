import React, { useState, useEffect } from 'react';
import LoginBarberia from './LoginBarberia';
import DashboardBarberia from './DashboardBarberia';
import SEOHead from '@/components/SEOHead';

const GestionBarberia: React.FC = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [permisos, setPermisos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const usuarioGuardado = localStorage.getItem('barberia_usuario');
    const rolGuardado = localStorage.getItem('barberia_rol');
    const permisosGuardados = localStorage.getItem('barberia_permisos');
    
    if (usuarioGuardado && rolGuardado && permisosGuardados) {
      setUsuario(usuarioGuardado);
      setRol(rolGuardado);
      setPermisos(JSON.parse(permisosGuardados));
      
      // Cargar información adicional del usuario si no existe
      cargarInformacionUsuarioCompleta(usuarioGuardado);
    }
    
    setCargando(false);
  }, []);

  const cargarInformacionUsuarioCompleta = async (nombreUsuario: string) => {
    try {
      // Si ya tenemos la lista de usuarios, no necesitamos cargar de nuevo
      const usuariosGuardados = localStorage.getItem('barberia_usuarios_list');
      if (usuariosGuardados) {
        console.log('ℹ️ Lista de usuarios ya existe en localStorage');
        return;
      }

      // Cargar usuarios para tener información completa
      const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdfUG33mMa-WIQJtlVkUiNkmM9RwXSKZYqZNShWO7dtjSCmgNpjRgA844eZkM4pVKH/exec';
      const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';
      
      const response = await fetch(
        `${GOOGLE_APPS_SCRIPT_URL}?action=getUsuarios&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`
      );
      
      const data = await response.json();
      
      if (data.success && data.usuarios) {
        // Procesar usuarios
        const usuariosProcesados = data.usuarios.map((user: any) => {
          let permisos = [];
          try {
            const permisosRaw = user.permisos || user['permisos '] || '[]';
            permisos = typeof permisosRaw === 'string' ? JSON.parse(permisosRaw) : permisosRaw;
            if (!Array.isArray(permisos)) {
              permisos = ['ver_turnos'];
            }
          } catch (error) {
            permisos = ['ver_turnos'];
          }

          return {
            id: String(user.id || ''),
            usuario: (user.usuario || user['usuario '] || '').trim(),
            nombre: (user.nombre || user['nombre '] || '').trim(),
            rol: (user.rol || user['rol '] || 'Empleado').trim(),
            permisos: permisos,
            barberoAsignado: (user.barberoAsignado || user['barberoAsignado '] || '').trim()
          };
        });
        
        localStorage.setItem('barberia_usuarios_list', JSON.stringify(usuariosProcesados));
        console.log('✅ Información de usuarios cargada correctamente');
      }
    } catch (error) {
      console.error('Error cargando información completa del usuario:', error);
    }
  };

  const handleLogin = (nombreUsuario: string, rolUsuario: string, permisosUsuario: string[]) => {
    setUsuario(nombreUsuario);
    setRol(rolUsuario);
    setPermisos(permisosUsuario);
    
    // Cargar información completa del usuario después del login
    cargarInformacionUsuarioCompleta(nombreUsuario);
  };

  const handleLogout = () => {
    setUsuario(null);
    setRol(null);
    setPermisos([]);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Gestión Barbería - Sistema PWA"
        description="Sistema de gestión interno PWA para empleados de Barbería Estilo"
      />
      
      {usuario && rol ? (
        <DashboardBarberia 
          usuario={usuario} 
          rol={rol}
          permisos={permisos}
          onLogout={handleLogout} 
        />
      ) : (
        <LoginBarberia onLogin={handleLogin} />
      )}
    </>
  );
};

export default GestionBarberia;
