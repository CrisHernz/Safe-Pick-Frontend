# 🎓 Safe Pick Frontend

Frontend moderno y responsivo para el sistema de gestión de retiros escolares Safe Pick, construido con React.

## ✨ Características

- **🔐 Autenticación JWT** - Login seguro con tokens
- **5 Dashboards Diferenciados** - Interfaces específicas por rol
- **📱 Responsive Design** - Funciona perfectamente en móviles y desktop
- **🎨 UI Moderna** - Diseño limpio con componentes reutilizables
- **⚡ Performance Optimizado** - Carga rápida y experiencia fluida
- **🔄 Estado en Tiempo Real** - Actualización automática de datos

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 16+ y npm
- Backend de Safe Pick ejecutándose

### Instalación

```bash
# Clonar el repositorio
cd Safe-Pick-Frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con la URL de tu backend
REACT_APP_API_URL=http://localhost:3000

# Iniciar en modo desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📂 Estructura del Proyecto

```
src/
├── components/
│   ├── common/           # Componentes reutilizables
│   │   ├── Navbar.js
│   │   ├── Card.js
│   │   ├── Modal.js
│   │   ├── Loading.js
│   │   └── StatCard.js
│   ├── dashboards/       # Dashboards por rol
│   │   ├── AdminDashboard.js
│   │   ├── AdminEscolarDashboard.js
│   │   ├── PadreDashboard.js
│   │   ├── GuardiaDashboard.js
│   │   └── EncargadoDashboard.js
│   └── Login.js          # Pantalla de login
├── services/             # Servicios de API
│   ├── api.service.js    # Cliente HTTP
│   └── auth.service.js   # Gestión de autenticación
├── utils/                # Utilidades
│   └── helpers.js        # Funciones auxiliares
├── styles/               # Estilos globales
│   └── global.css        # Variables CSS y tema
├── App.js               # Componente principal
└── index.js             # Punto de entrada
```

---

## 👥 Roles y Funcionalidades

### 🔑 Admin (Administrador del Sistema)

- ✅ Gestión completa de instituciones educativas
- ✅ Administración de usuarios (activar/desactivar)
- ✅ Estadísticas globales del sistema
- ✅ Historial completo de retiros
- ✅ Monitoreo de actividad

### 🏫 Admin Escolar

- ✅ Registro y gestión de padres de familia
- ✅ Registro y gestión de estudiantes
- ✅ Registro y gestión de guardias de seguridad
- ✅ Estadísticas de la institución
- ✅ Reportes por grado y sección

### 👨‍👩‍👧‍👦 Padre/Madre

- ✅ Ver información de sus hijos
- ✅ Registrar personas autorizadas para retiros
- ✅ Generar códigos QR para retiros
- ✅ Historial de códigos generados
- ✅ Gestión de personas autorizadas

### 🛡️ Guardia de Seguridad

- ✅ Escaneo y validación de códigos QR
- ✅ Confirmación de retiros
- ✅ Rechazo de retiros con justificación
- ✅ Historial de validaciones
- ✅ Estadísticas personales
- ✅ Vista de códigos pendientes

### 👤 Encargado (Persona Autorizada)

- ✅ Vista informativa del proceso
- ✅ Instrucciones de uso
- ✅ Información de contacto

---

## 🎨 Componentes Principales

### Navbar

Barra de navegación con información del usuario y logout.

```jsx
<Navbar />
```

### Card

Contenedor reutilizable para contenido.

```jsx
<Card title="Título" subtitle="Subtítulo" actions={<button>Acción</button>}>
  Contenido
</Card>
```

### StatCard

Tarjeta para mostrar estadísticas.

```jsx
<StatCard title="Total Usuarios" value={150} icon="👥" color="primary" />
```

### Modal

Ventana modal para formularios y confirmaciones.

```jsx
<Modal isOpen={show} onClose={() => setShow(false)} title="Título del Modal">
  Contenido del modal
</Modal>
```

### Loading

Indicador de carga.

```jsx
<Loading text="Cargando datos..." />
```

---

## 🔧 Servicios

### API Service

Cliente HTTP centralizado para todas las peticiones al backend.

```javascript
import apiService from "./services/api.service";

// Ejemplos de uso
const institutions = await apiService.getInstitutions();
const user = await apiService.login(email, password);
const qrCode = await apiService.generateWithdrawalCode(data);
```

### Auth Service

Gestión de autenticación y sesión.

```javascript
import authService from "./services/auth.service";

// Ejemplos de uso
authService.saveAuth(authData);
const user = authService.getUser();
const isAuth = authService.isAuthenticated();
authService.logout();
```

---

## 🎨 Tema y Estilos

El proyecto usa CSS Variables para un tema consistente:

```css
/* Colores principales */
--primary-color: #3b82f6;
--accent-color: #10b981;
--warning-color: #f59e0b;
--danger-color: #ef4444;

/* Estados */
--status-pending: #f59e0b;
--status-confirmed: #10b981;
--status-rejected: #ef4444;
```

### Clases Utilitarias

```html
<!-- Botones -->
<button class="btn btn-primary">Primario</button>
<button class="btn btn-secondary">Secundario</button>
<button class="btn btn-danger">Peligro</button>

<!-- Badges -->
<span class="badge status-confirmed">Confirmado</span>
<span class="badge status-pending">Pendiente</span>

<!-- Alertas -->
<div class="alert alert-success">Operación exitosa</div>
<div class="alert alert-danger">Error</div>
```

---

## 📱 Responsive Design

Todos los componentes son completamente responsive:

- **Desktop**: Vista completa con todas las funcionalidades
- **Tablet**: Layout adaptado a 2 columnas
- **Mobile**: Vista en una sola columna con navegación optimizada

Breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🔒 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación:

1. Usuario ingresa credenciales en `/login`
2. Backend valida y retorna token + datos de usuario
3. Token se guarda en `localStorage`
4. Todas las peticiones subsecuentes incluyen el token en headers
5. Redirección automática según rol del usuario

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia servidor de desarrollo en puerto 3000

# Producción
npm run build          # Compila para producción en /build
npm run test           # Ejecuta tests
npm run eject          # Eyecta configuración (irreversible)
```

---

## 🌐 Deployment

### Build de Producción

```bash
npm run build
```

El build optimizado estará en la carpeta `build/`.

### Variables de Entorno

Crea un archivo `.env.production`:

```env
REACT_APP_API_URL=https://api-production.com
```

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Despliegue en Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

---

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm test -- --coverage
```

---

## 📊 Flujo de Usuario

### Flujo Padre

1. Login con credenciales
2. Ver dashboard con lista de hijos
3. Registrar personas autorizadas
4. Generar código QR seleccionando:
   - Hijo a retirar
   - Persona autorizada
5. Código QR enviado (válido 24h)

### Flujo Guardia

1. Login con credenciales
2. Escanear código QR presentado
3. Validar información:
   - Estudiante
   - Persona autorizada
   - DNI coincidente
4. Confirmar o rechazar retiro
5. Registro en historial

---

## 🐛 Troubleshooting

### Error: Cannot connect to API

Verifica que:

- El backend esté ejecutándose
- `REACT_APP_API_URL` esté correctamente configurado
- No haya problemas de CORS

### Token expirado

Si ves errores de autenticación:

1. Cierra sesión
2. Vuelve a iniciar sesión
3. El nuevo token se guardará automáticamente

### Estilos no se cargan

Asegúrate de que `global.css` esté importado en `index.js`:

```javascript
import "./styles/global.css";
```

---

## 🔐 Usuarios de Prueba

Usa estos usuarios para probar (password: `password123`):

| Rol               | Email                               |
| ----------------- | ----------------------------------- |
| **Admin**         | admin@safepick.com                  |
| **Admin Escolar** | admin.escolar@colegiosanjose.edu.pe |
| **Guardia**       | guardia1@colegiosanjose.edu.pe      |
| **Padre**         | juan.perez@gmail.com                |

---

## 📝 Próximas Mejoras

- [ ] Generación de QR como imagen descargable
- [ ] Envío de QR por WhatsApp
- [ ] Notificaciones en tiempo real
- [ ] Modo oscuro
- [ ] Soporte multiidioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Exportar reportes a PDF/Excel

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte del curso de Software Seguro.

---

## 👨‍💻 Desarrollo

Construido con ❤️ usando:

- React 19
- React Router v6
- CSS Variables
- Fetch API

---

**¡Listo para usar! 🚀**

Para cualquier duda, revisa la documentación del backend en `Safe-Pick-Backend/API_DOCUMENTATION.md`.
