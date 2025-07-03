import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgregarTurno from './AgregarTurno';
import { useToast } from '@/hooks/use-toast';

interface Turno {
  id: string;
  nombre: string;
  email: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  servicio: string;
  valor: number;
  responsable: string;
  estado: string;
  origen: string;
  descripcion?: string;
}

interface TurnosDiaProps {
  permisos: string[];
  usuario: string;
  rol?: string;
}

// URL ACTUALIZADA de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdfUG33mMa-WIQJtlVkUiNkmM9RwXSKZYqZNShWO7dtjSCmgNpjRgA844eZkM4pVKH/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const TurnosDia: React.FC<TurnosDiaProps> = ({ permisos, usuario, rol }) => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [turnosSinFiltrar, setTurnosSinFiltrar] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mostrarAgregarTurno, setMostrarAgregarTurno] = useState(false);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>('todos');
  const [barberosDisponibles, setBarberosDisponibles] = useState<string[]>([]);
  const { toast } = useToast();

  // Función para obtener el barbero asignado al usuario logueado
  const obtenerBarberoAsignadoUsuario = () => {
    try {
      const usuariosGuardados = localStorage.getItem('barberia_usuarios_list');
      if (usuariosGuardados) {
        const usuarios = JSON.parse(usuariosGuardados);
        const usuarioActual = usuarios.find((u: any) => u.usuario === usuario);
        
        if (usuarioActual && usuarioActual.barberoAsignado && usuarioActual.barberoAsignado !== 'todos') {
          console.log('👤 Barbero asignado encontrado en lista:', usuarioActual.barberoAsignado);
          return usuarioActual.barberoAsignado;
        }
      }
      
      console.log('👤 Usuario puede ver todos los barberos');
      return null;
    } catch (error) {
      console.error('Error al obtener barbero asignado:', error);
      return null;
    }
  };

  const realizarFetchConReintentos = async (url: string, options?: RequestInit, maxReintentos = 3) => {
    let ultimoError;
    
    for (let intento = 1; intento <= maxReintentos; intento++) {
      try {
        console.log(`🔄 Intento ${intento} de ${maxReintentos} para fetch`);
        console.log('🔗 URL:', url);
        console.log('⚙️ Options:', options);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        ultimoError = error;
        console.error(`❌ Error en intento ${intento}:`, error);
        
        if (intento < maxReintentos) {
          const delay = intento * 2000;
          console.log(`⏳ Reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw ultimoError;
  };

  const obtenerTurnos = async () => {
    setCargando(true);
    setError('');
    try {
      console.log('🔄 Iniciando obtención de turnos...');
      const response = await realizarFetchConReintentos(
        `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`
      );
      
      const data = await response.json();
      console.log('📄 Datos recibidos:', data);

      if (data.success) {
        const turnosConvertidos = data.eventos.map((evento: any) => {
          let fechaEvento, horaInicio, horaFin;
          
          try {
            if (typeof evento.Fecha === 'string' && evento.Fecha.includes('T')) {
              fechaEvento = new Date(evento.Fecha);
            } else {
              fechaEvento = new Date(evento.Fecha);
            }

            if (typeof evento['Hora Inicio'] === 'string' && evento['Hora Inicio'].includes('T')) {
              horaInicio = new Date(evento['Hora Inicio']);
            } else {
              horaInicio = new Date(evento['Hora Inicio']);
            }

            if (typeof evento['Hora Fin'] === 'string' && evento['Hora Fin'].includes('T')) {
              horaFin = new Date(evento['Hora Fin']);
            } else {
              horaFin = new Date(evento['Hora Fin']);
            }
          } catch (e) {
            console.error('Error parsing dates for event:', evento, e);
            fechaEvento = new Date();
            horaInicio = new Date();
            horaFin = new Date();
          }
          
          let estadoMapeado = evento.Estado;
          
          return {
            id: evento.ID_Evento,
            nombre: evento.Nombre_Cliente,
            email: evento.Email_Cliente,
            fecha: fechaEvento.toISOString().split('T')[0],
            horaInicio: horaInicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
            horaFin: horaFin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
            servicio: evento.Titulo_Evento || evento['Servicios incluidos'],
            valor: evento['Valor del turno'] || 0,
            responsable: evento.Responsable,
            estado: estadoMapeado,
            origen: evento.Estado === 'Completado' && evento.Nombre_Cliente === 'Atención directa en local' ? 'manual' : 'reserva',
            descripcion: evento.Descripcion
          };
        });

        // Extraer barberos únicos para el filtro - properly typed
        const responsablesValidos = turnosConvertidos
          .map((turno: Turno) => turno.responsable)
          .filter((responsable): responsable is string => 
            typeof responsable === 'string' && responsable.trim() !== ''
          );
        const barberosUnicos: string[] = [...new Set(responsablesValidos)];
        setBarberosDisponibles(barberosUnicos);

        // Aplicar filtros
        const fechaSeleccionada = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        const turnosFiltradosPorFecha = turnosConvertidos.filter((turno: Turno) => turno.fecha === fechaSeleccionada);
        
        // Guardar turnos sin filtrar por barbero para estadísticas
        setTurnosSinFiltrar(turnosFiltradosPorFecha);

        // Aplicar filtros según el rol y barbero seleccionado
        let turnosFiltrados = turnosFiltradosPorFecha;

        // Si el usuario es empleado y tiene barbero asignado específico
        const barberoAsignado = obtenerBarberoAsignadoUsuario();
        if (rol === 'Empleado' && barberoAsignado) {
          turnosFiltrados = turnosFiltradosPorFecha.filter((turno: Turno) => turno.responsable === barberoAsignado);
        }
        // Si el usuario es barbero y ha seleccionado un barbero específico
        else if (rol === 'Barbero' && barberoSeleccionado !== 'todos') {
          turnosFiltrados = turnosFiltradosPorFecha.filter((turno: Turno) => turno.responsable === barberoSeleccionado);
        }

        turnosFiltrados.sort((a: Turno, b: Turno) => a.horaInicio.localeCompare(b.horaInicio));
        
        setTurnos(turnosFiltrados);
        console.log('✅ Turnos cargados exitosamente:', turnosFiltrados.length);
      } else {
        const errorMsg = data.error || 'Error desconocido al cargar los turnos';
        console.error('❌ Error de API:', errorMsg);
        setError(errorMsg);
        
        toast({
          title: "Error al cargar turnos",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("❌ Error completo al obtener los turnos:", e);
      let errorMessage = 'Error de conexión al cargar los turnos';
      
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          errorMessage = 'Tiempo de espera agotado. Verifique su conexión a internet.';
        } else if (e.message.includes('fetch')) {
          errorMessage = 'Error de red. Verifique su conexión a internet y que el servidor esté disponible.';
        } else {
          errorMessage = `Error de conexión: ${e.message}`;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  const cancelarTurno = async (turnoId: string) => {
    try {
      console.log('🔄 Cancelando turno:', turnoId);
      
      const formData = new URLSearchParams();
      formData.append('action', 'cancelarTurno');
      formData.append('apiKey', API_SECRET_KEY);
      formData.append('eventId', turnoId);

      console.log('📤 Request body FormData:', formData.toString());

      const response = await realizarFetchConReintentos(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const result = await response.json();
      console.log('✅ Response result:', result);

      if (result.success) {
        setTurnos(prevTurnos =>
          prevTurnos.map(turno =>
            turno.id === turnoId ? { ...turno, estado: 'Cancelado' } : turno
          )
        );
        
        toast({
          title: "Turno cancelado",
          description: "El turno se ha cancelado correctamente.",
        });
      } else {
        throw new Error(result.error || 'Error desconocido del servidor');
      }

    } catch (error) {
      console.error('❌ Error completo al cancelar el turno:', error);
      
      let errorMessage = 'Error de conexión al cancelar el turno';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Tiempo de espera agotado al cancelar el turno';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Error de red al cancelar el turno. Verifique su conexión.';
        } else {
          errorMessage = `Error al cancelar: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const calcularEstadisticas = () => {
    // Las estadísticas ahora siempre se basan en la lista 'turnos', que ya está filtrada.
    const turnosParaEstadisticas = turnos;

    const confirmados = turnosParaEstadisticas.filter(t => t.estado === 'Confirmado').length;
    const completados = turnosParaEstadisticas.filter(t => t.estado === 'Completado').length;
    const cancelados = turnosParaEstadisticas.filter(t => t.estado === 'Cancelado').length;

    const totalIngresosDia = turnosParaEstadisticas
      .filter(t => t.estado === 'Reservado' || t.estado === 'Confirmado')
      .reduce((sum, t) => sum + (t.valor || 0), 0);

    return {
      totalTurnos: turnosParaEstadisticas.length,
      confirmados,
      completados,
      cancelados,
      ingresosDia: totalIngresosDia
    };
  };

  const renderEstadisticasAdmin = () => {
    const stats = calcularEstadisticas();
    const barberoAsignado = obtenerBarberoAsignadoUsuario();
    const filtroLabel = barberoSeleccionado === 'todos' ? '(Todos los barberos)' : `(${barberoSeleccionado})`;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-800">Confirmados</CardTitle>
            {rol === 'Barbero' && <p className="text-xs text-green-600">{filtroLabel}</p>}
            {rol === 'Empleado' && barberoAsignado && <p className="text-xs text-green-600">({barberoAsignado})</p>}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.confirmados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800">Cancelados</CardTitle>
            {rol === 'Barbero' && <p className="text-xs text-red-600">{filtroLabel}</p>}
            {rol === 'Empleado' && barberoAsignado && <p className="text-xs text-red-600">({barberoAsignado})</p>}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-indigo-800">Ingresos del Día</CardTitle>
            {rol === 'Barbero' && <p className="text-xs text-indigo-600">{filtroLabel}</p>}
            {rol === 'Empleado' && barberoAsignado && <p className="text-xs text-indigo-600">({barberoAsignado})</p>}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">${stats.ingresosDia.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    if (estado === 'Reservado') {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    } else if (estado === 'Completado') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (estado === 'Cancelado') {
      return `${baseClasses} bg-red-100 text-red-800`;
    } else if (estado === 'Cliente Ausente') {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  // Actualizar turnos cuando cambie la fecha o el barbero seleccionado
  useEffect(() => {
    obtenerTurnos();
  }, [date, barberoSeleccionado]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Cargando turnos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error: {error}</div>
        <Button 
          onClick={obtenerTurnos} 
          className="mt-2" 
          size="sm"
          variant="outline"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(permisos.includes('admin') || rol === 'Barbero') && renderEstadisticasAdmin()}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Turnos del Día</h2>
          {obtenerBarberoAsignadoUsuario() && rol === 'Empleado' && (
            <p className="text-sm text-gray-600">Barbero: {obtenerBarberoAsignadoUsuario()}</p>
          )}
          {rol === 'Barbero' && barberoSeleccionado !== 'todos' && (
            <p className="text-sm text-gray-600">Filtrando por: {barberoSeleccionado}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Filtro por barbero solo para usuarios con rol "Barbero" */}
          {rol === 'Barbero' && barberosDisponibles.length > 0 && (
            <Select value={barberoSeleccionado} onValueChange={setBarberoSeleccionado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por barbero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los barberos</SelectItem>
                {barberosDisponibles.map((barbero) => (
                  <SelectItem key={barbero} value={barbero}>
                    {barbero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                📅 {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999] bg-white shadow-lg border rounded-md" align="end">
              <Calendar
                mode="single"
                locale={es}
                selected={date}
                onSelect={setDate}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {turnos.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-gray-500">No hay turnos para esta fecha</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {turnos.map((turno) => (
            <Card key={turno.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-gray-500">Hora</p>
                    <p className="font-mono text-lg">{turno.horaInicio} - {turno.horaFin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{turno.nombre}</p>
                    <p className="text-sm text-green-600 font-medium">${turno.valor.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Servicio</p>
                    <p className="font-medium">{turno.servicio}</p>
                    <p className="text-sm text-gray-600">{turno.responsable}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={getEstadoBadge(turno.estado)}>
                      {turno.estado}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 md:flex-col lg:flex-row">
                  {(turno.estado === 'Reservado' || turno.estado === 'Confirmado') && (
                    <Button
                      onClick={() => cancelarTurno(turno.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 flex-1 md:flex-none"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mostrarAgregarTurno && (
        <AgregarTurno
          onClose={() => setMostrarAgregarTurno(false)}
          onTurnoAgregado={() => {
            obtenerTurnos();
            setMostrarAgregarTurno(false);
          }}
          fechaSeleccionada={date || new Date()}
        />
      )}
    </div>
  );
};

export default TurnosDia;