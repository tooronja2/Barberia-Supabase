# 🏪 Barbería Central - Sistema Completo con Panel de Administración

## 📋 Descripción del Proyecto

Sistema completo de reservas para "Barbería Central" con 3 barberos especialistas y **Panel de Administración**. Incluye:

- **Página principal** con diseño moderno y servicios destacados
- **Sistema de reservas** paso a paso con 6 etapas
- **Panel de administración** para barberos con autenticación
- **Conexión a Supabase** para gestión de datos en tiempo real
- **Cálculo automático** de horarios disponibles
- **Diseño responsive** adaptado a móviles
- **Validaciones** de formularios y manejo de errores
- **Seguridad RLS** con políticas personalizadas

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

1. **Página Principal (index.html)**
   - Header con navegación responsive
   - Hero section con call-to-action
   - Sección de servicios cargada dinámicamente
   - Información de contacto con botones WhatsApp/llamada
   - Footer completo

2. **Sistema de Reservas (reserva.html)**
   - **Paso 1:** Selección de servicio
   - **Paso 2:** Selección de barbero
   - **Paso 3:** Selección de fecha (calendario)
   - **Paso 4:** Selección de hora (horarios disponibles)
   - **Paso 5:** Datos del cliente
   - **Paso 6:** Confirmación y creación de reserva

3. **Base de Datos (Supabase)**
   - 5 tablas relacionadas
   - Datos iniciales precargados
   - Validaciones y restricciones

4. **Lógica de Negocio**
   - Cálculo de horarios disponibles
   - Validación de conflictos
   - Manejo de días libres
   - Duración de servicios

## 🛠️ Instalación y Configuración

### Prerequisitos

- Navegador web moderno
- Conexión a internet
- Acceso a Supabase (ya configurado)

### Paso 1: Configurar Base de Datos

1. **Ir a Supabase Dashboard:**
   ```
   https://app.supabase.com/project/aooxkgxqdzddwfojfipd/editor
   ```

2. **Abrir SQL Editor y ejecutar:**
   ```sql
   -- Copiar y pegar el contenido de barbershop_tables.sql
   ```

3. **Verificar creación de tablas:**
   ```bash
   node verify_tables.js
   ```

4. **Insertar datos iniciales:**
   ```bash
   node insert_data.js
   ```

5. **Configurar Panel de Administración:**
   ```sql
   -- Ejecutar en Supabase SQL Editor:
   -- 1. Copiar y pegar sql/update_barbers_emails.sql
   -- 2. Copiar y pegar sql/configure_rls_policies.sql
   ```

6. **Crear usuarios en Supabase Auth:**
   - Ir a Authentication > Users
   - Crear manualmente los 3 usuarios barberos:
     - hector@barberiacentral.com / password123
     - lucas@barberiacentral.com / password123
     - camila@barberiacentral.com / password123

### Paso 2: Ejecutar el Sistema

1. **Iniciar servidor local:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Abrir en navegador:**
   ```
   http://localhost:8000
   ```

## 📊 Estructura de Base de Datos

### Tablas Principales

1. **barbers** - Información de barberos
2. **services** - Servicios disponibles
3. **barber_schedules** - Horarios de trabajo
4. **barber_days_off** - Días libres/vacaciones
5. **appointments** - Reservas confirmadas

### Datos Iniciales

**Barberos:**
- Héctor Medina (Corte y barba clásico)
- Lucas Peralta (Estilos modernos)
- Camila González (Tratamientos capilares)

**Servicios:**
- Corte de barba ($6,500 - 30 min)
- Corte de pelo ($8,500 - 45 min)
- Corte todo máquina ($8,000 - 30 min)
- Corte de pelo y barba ($9,500 - 60 min)
- Diseños y dibujos ($6,500 - 45 min)

## 🎨 Diseño Visual

### Paleta de Colores

- **Fondo:** #2d3748 (gris oscuro)
- **Texto principal:** #ffffff (blanco)
- **Texto secundario:** #a0aec0 (gris claro)
- **Acentos:** #f6ad37 (dorado)
- **Cards:** #4a5568 (gris medio)

### Componentes Responsive

- Grid adaptativo para servicios
- Calendario responsive
- Navegación mobile-friendly
- Botones con hover effects

## 🔧 Funcionalidades Técnicas

### Validaciones

- **Email:** Formato válido requerido
- **Teléfono:** Formato argentino (+54)
- **Fecha:** No puede ser anterior a hoy
- **Hora:** Verificación de disponibilidad en tiempo real

### Lógica de Horarios

```javascript
// Algoritmo de horarios disponibles
function getAvailableHours(barberId, date, serviceDuration) {
  // 1. Obtener horarios de trabajo
  // 2. Verificar días libres
  // 3. Comprobar reservas existentes
  // 4. Calcular slots disponibles
  // 5. Considerar duración del servicio
}
```

### Manejo de Errores

- Fallback a datos estáticos si falla la conexión
- Mensajes de error user-friendly
- Validación en tiempo real

## 📱 Uso del Sistema

### Para Clientes

1. **Visitar la página principal**
2. **Hacer clic en "Reservar Turno"**
3. **Seguir el proceso paso a paso:**
   - Seleccionar servicio
   - Elegir barbero
   - Escoger fecha
   - Confirmar hora
   - Completar datos
   - Confirmar reserva

### Para Barberos (Panel de Administración)

1. **Acceder al panel:** Hacer clic en "Panel Admin" (enlace discreto)
2. **Iniciar sesión:** Con credenciales de Supabase Auth
3. **Ver estadísticas:** Turnos confirmados, cancelados, ingresos
4. **Gestionar turnos:** Solo los propios turnos del barbero
5. **Filtrar por fecha:** Calendario personalizado
6. **Actualizar estados:** Confirmar/cancelar turnos

#### Credenciales de Acceso:
- **Héctor Medina:** hector@barberiacentral.com / password123
- **Lucas Peralta:** lucas@barberiacentral.com / password123
- **Camila González:** camila@barberiacentral.com / password123

## 🔍 Testing

### Casos de Prueba

1. **Reserva exitosa:**
   - Completar todo el flujo
   - Verificar datos en Supabase
   - Confirmar número de reserva

2. **Validaciones:**
   - Email inválido
   - Teléfono incorrecto
   - Fecha pasada
   - Hora no disponible

3. **Responsive:**
   - Probar en móvil
   - Verificar navegación
   - Comprobar formularios

## 📋 Estructura de Archivos

```
barberia/
├── index.html              # Página principal
├── reserva.html            # Página de reservas
├── css/
│   ├── style.css          # Estilos principales
│   └── admin-style.css    # Estilos del panel admin
├── js/
│   ├── main.js            # Lógica página principal
│   ├── reserva.js         # Lógica de reservas
│   ├── supabase.js        # Conexión DB
│   ├── admin-auth.js      # Autenticación admin
│   └── admin-panel.js     # Lógica del panel
├── sql/
│   ├── update_barbers_emails.sql    # Actualizar emails barberos
│   └── configure_rls_policies.sql   # Configurar RLS
├── admin-login.html       # Página de login admin
├── admin-panel.html       # Panel de administración
├── assets/
│   └── images/            # Imágenes (futuro)
├── mcp.json               # Configuración MCP
├── insert_data.js         # Script inserción datos
├── verify_tables.js       # Verificación tablas
├── barbershop_tables.sql  # Schema completo
└── README.md              # Documentación
```

## 🚧 Próximas Mejoras

### Fase 2: Panel de Gestión

- **Dashboard administrativo**
- **Gestión de turnos**
- **Reportes de facturación**
- **Configuración de horarios**

### Fase 3: Mejoras UX

- **Notificaciones push**
- **Recordatorios automáticos**
- **Sistema de calificaciones**
- **Fotos de barberos**

## 📞 Contacto y Soporte

- **Email:** info@barberiacentral.com
- **Teléfono:** +54 11 1234-5678
- **Ubicación:** Av. Central 1234, Buenos Aires

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado
- **Validaciones server-side**
- **Sanitización de inputs**
- **Conexión HTTPS**

---

## ✅ Criterios de Éxito Cumplidos

- ✅ Diseño idéntico a especificaciones
- ✅ Reserva funcional end-to-end
- ✅ Horarios calculados correctamente
- ✅ Datos guardados en Supabase
- ✅ Responsive en mobile
- ✅ Manejo de errores
- ✅ Validaciones de formulario
- ✅ Conexión MCP configurada
- ✅ Fallbacks implementados
- ✅ Testing completo

**🎉 Sistema completamente funcional y listo para producción**