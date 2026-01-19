# SafePick Frontend

Interfaz de usuario para el sistema de retiro escolar seguro SafePick.

## 🎯 Funcionalidad Principal

Aplicación React que proporciona interfaces para cada rol del sistema:

- **Login/Registro** - Autenticación de usuarios y pickers temporales
- **Dashboard Padre** - Crear órdenes de retiro y generar credenciales
- **Dashboard Guardia** - Escanear QR y completar retiros
- **Dashboard Gestor** - Administrar guardias y padres de su institución
- **Dashboard Admin** - Gestión global de instituciones y gestores
- **Dashboard Picker** - Ver orden asignada y código QR

## 🛠️ Tecnologías

- React 18
- React Router DOM
- Context API (AuthContext)
- html5-qrcode (escáner)
- qrcode (generación)

## ⚡ Instalación

```bash
# Instalar dependencias
npm install

# Configurar API URL (opcional)
# Por defecto apunta a http://localhost:3001
```

## 🚀 Ejecución

```bash
# Desarrollo
npm start

# Build producción
npm run build

# Servir build local
npx serve -s build
```

## 📱 Rutas de la Aplicación

| Ruta                 | Descripción        | Acceso   |
| -------------------- | ------------------ | -------- |
| `/`                  | Login principal    | Público  |
| `/register`          | Registro de padres | Público  |
| `/picker-login`      | Login de pickers   | Público  |
| `/dashboard/padre`   | Panel del padre    | PARENT   |
| `/dashboard/guardia` | Panel del guardia  | GUARDIAN |
| `/dashboard/gestor`  | Panel del gestor   | GESTOR   |
| `/dashboard/admin`   | Panel del admin    | ADMIN    |
| `/picker-dashboard`  | Panel del picker   | PICKER   |

## 🔐 Flujos de Usuario

### Padre de Familia

1. Inicia sesión con email y contraseña
2. Ve lista de hijos registrados
3. Crea orden de retiro seleccionando hijo y picker
4. Genera credenciales (cédula + código de 6 dígitos)
5. Comparte credenciales con el picker

### Picker (Encargado Temporal)

1. Recibe cédula y código del padre
2. Ingresa en `/picker-login`
3. Ve su código QR en el dashboard
4. Presenta QR al guardia en la escuela

### Guardia

1. Inicia sesión con credenciales institucionales
2. Activa escáner de cámara
3. Escanea QR del picker
4. Verifica cédula física del picker
5. Confirma y completa el retiro

### Gestor

1. Administra guardias de su institución
2. Ve padres y niños registrados
3. Puede crear nuevos guardias

### Admin

1. Gestiona todas las instituciones
2. Crea y asigna gestores
3. Ve estadísticas globales

## 🔒 Seguridad Implementada

- ✅ Token JWT almacenado en localStorage
- ✅ AuthContext para estado de autenticación
- ✅ Validación de cédula ecuatoriana en cliente
- ✅ Inputs de cédula limitados a 10 dígitos
- ✅ Validación de contraseña OWASP (12+ chars)
- ✅ Mensajes de error genéricos
- ✅ Redirección por rol tras login

## 📦 Estructura de Carpetas

```
src/
├── components/
│   ├── Login.js           # Login principal
│   ├── Register.js        # Registro de padres
│   ├── PickerLogin.js     # Login de pickers
│   ├── PickerDashboard.js # Dashboard picker
│   └── dashboards/
│       ├── PadreDashboard.js
│       ├── GuardiaDashboard.js
│       ├── GestorDashboard.js
│       └── AdminDashboard.js
├── context/
│   └── AuthContext.js     # Estado de autenticación
├── services/
│   ├── api.service.js     # Cliente HTTP
│   └── authService.js     # Servicios de auth
├── utils/
│   └── ecuadorValidation.js # Validaciones EC
└── config/
    └── api.js             # Configuración API
```

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en vercel.com
2. Configurar variable `REACT_APP_API_URL`
3. Deploy automático en cada push

### Manual

```bash
npm run build
# Subir carpeta /build a servidor estático
```

## 👤 Credenciales de Prueba

Contraseña para todos: `Password123!`

- **Admin:** admin@safepick.com
- **Gestor:** gestor.sanjose@safepick.com
- **Guardia:** guardia1@sanjose.edu.ec
- **Padre:** cristian.hernandez@gmail.com

---

**Puerto por defecto:** 3000
