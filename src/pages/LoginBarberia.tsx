import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';

interface LoginBarberiaProps {
  onLogin: (usuario: string, rol: string, permisos: string[]) => void;
}

// URLs de Google Apps Script - SINCRONIZADA con GestionUsuarios
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdfUG33mMa-WIQJtlVkUiNkmM9RwXSKZYqZNShWO7dtjSCmgNpjRgA844eZkM4pVKH/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const LoginBarberia: React.FC<LoginBarberiaProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const limpiarDatosUsuario = (user: any) => {
    // Función para limpiar espacios extra en las propiedades (igual que en GestionUsuarios)
    const limpiarPropiedad = (valor: any) => {
      if (typeof valor === 'string') {
        return valor.trim();
      }
      return valor;
    };

    // Procesar permisos - puede venir como string JSON o array
    let permisos = [];
    try {
      const permisosRaw = user.permisos || user['permisos '] || '[]';
      permisos = typeof permisosRaw === 'string' ? JSON.parse(permisosRaw) : permisosRaw;
      if (!Array.isArray(permisos)) {
        permisos = ['ver_turnos'];
      }
    } catch (error) {
      console.error('Error al parsear permisos:', error);
      permisos = ['ver_turnos'];
    }

    return {
      id: String(user.id || ''),
      usuario: limpiarPropiedad(user.usuario || user['usuario '] || ''),
      password: limpiarPropiedad(user.password || user['password '] || ''),
      nombre: limpiarPropiedad(user.nombre || user['nombre '] || ''),
      rol: limpiarPropiedad(user.rol || user['rol '] || 'Empleado'),
      permisos: permisos,
      barberoAsignado: limpiarPropiedad(user.barberoAsignado || user['barberoAsignado '] || '')
    };
  };

  const validarUsuarioEnGoogleSheets = async (usuario: string, password: string) => {
    try {
      console.log('🔄 Validando usuario en Google Sheets...');
      console.log('🔑 Usuario:', usuario, 'Password:', password ? '***' : 'VACIO');
      
      // Primero obtenemos todos los usuarios
      const response = await fetch(
        `${GOOGLE_APPS_SCRIPT_URL}?action=getUsuarios&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`
      );
      
      const data = await response.json();
      console.log('📄 Respuesta getUsuarios para login:', data);

      if (data.success && data.usuarios) {
        // Procesar y limpiar datos de usuarios
        const usuariosProcesados = data.usuarios.map(limpiarDatosUsuario);
        console.log('✅ Usuarios procesados para validación:', usuariosProcesados);
        
        // Buscar el usuario que coincida
        const usuarioEncontrado = usuariosProcesados.find(u => 
          u.usuario.toLowerCase() === usuario.toLowerCase() && u.password === password
        );
        
        console.log('🔍 Usuario encontrado:', usuarioEncontrado ? 'SI' : 'NO');
        
        if (usuarioEncontrado) {
          return {
            valido: true,
            usuario: usuarioEncontrado
          };
        } else {
          return {
            valido: false,
            error: 'Usuario o contraseña incorrectos'
          };
        }
      } else {
        return {
          valido: false,
          error: data.error || 'Error al obtener usuarios'
        };
      }
    } catch (error) {
      console.error('❌ Error al validar usuario:', error);
      return {
        valido: false,
        error: 'Error de conexión al validar usuario'
      };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    console.log('🔐 Intentando login con:', { usuario: usuario, password: '***' });
    
    // Validar solo en Google Sheets
    const validacionGoogleSheets = await validarUsuarioEnGoogleSheets(usuario, password);
    
    if (validacionGoogleSheets.valido && validacionGoogleSheets.usuario) {
      const usuarioValidado = validacionGoogleSheets.usuario;
      console.log('✅ Login exitoso desde Google Sheets:', usuarioValidado.nombre);
      
      localStorage.setItem('barberia_usuario', usuarioValidado.nombre);
      localStorage.setItem('barberia_rol', usuarioValidado.rol);
      localStorage.setItem('barberia_permisos', JSON.stringify(usuarioValidado.permisos));
      localStorage.setItem('barberia_barbero_asignado', usuarioValidado.barberoAsignado || '');
      onLogin(usuarioValidado.nombre, usuarioValidado.rol, usuarioValidado.permisos);
    } else {
      console.log('❌ Login fallido:', validacionGoogleSheets.error);
      setError(validacionGoogleSheets.error || 'Usuario o contraseña incorrectos');
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Barbería Estilo</CardTitle>
          <p className="text-gray-600">Sistema de Gestión PWA v3.0</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? 'Validando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginBarberia;
