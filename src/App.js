/**
 * @fileoverview Componente Principal de la Aplicación SafePick
 * @module App
 * @security ROUTING - Configuración de rutas y control de acceso
 *
 * @description
 * Componente raíz que configura el enrutamiento y proveedores de contexto.
 * Define todas las rutas de la aplicación y sus permisos.
 *
 * ## Rutas Públicas:
 * - /login, / - Inicio de sesión usuarios
 * - /register - Registro de nuevos padres
 * - /picker-login - Login de encargados temporales
 * - /picker-dashboard - Dashboard de pickers
 *
 * ## Rutas Protegidas (por rol):
 * - /dashboard/padre - Solo rol PARENT
 * - /dashboard/guardia - Solo rol GUARDIAN
 * - /dashboard/gestor - Solo rol GESTOR
 * - /dashboard/admin - Solo rol ADMIN
 *
 * ## Seguridad:
 * - AuthProvider envuelve toda la aplicación
 * - Cada dashboard verifica rol en su componente
 * - Rutas no encontradas redirigen a login
 *
 * @see AuthProvider - Proveedor de contexto de autenticación
 */
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import PickerLogin from "./components/PickerLogin";
import PickerDashboard from "./components/PickerDashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  PadreDashboard,
  GuardiaDashboard,
  AdminDashboard,
  GestorDashboard,
} from "./components/dashboards";
import { AuthProvider } from "./context/AuthContext";

/**
 * Componente principal de la aplicación
 *
 * Estructura:
 * - AuthProvider: Provee estado de autenticación global
 * - Router: Maneja navegación SPA
 * - Routes: Define rutas disponibles
 *
 * @returns {JSX.Element} Aplicación completa con routing
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/picker-login" element={<PickerLogin />} />
          <Route path="/picker-dashboard" element={<PickerDashboard />} />
          <Route path="/register" element={<Register />} />
          {/* Rutas Principales */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          {/* Dashboards por Rol */}
          <Route path="/dashboard/padre" element={<PadreDashboard />} />
          <Route path="/dashboard/guardia" element={<GuardiaDashboard />} />
          <Route path="/dashboard/gestor" element={<GestorDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
