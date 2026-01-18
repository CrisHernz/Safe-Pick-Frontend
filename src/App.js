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
  EncargadoDashboard,
  GuardiaDashboard,
  AdminEscolarDashboard,
  AdminDashboard,
  GestorDashboard,
} from "./components/dashboards";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas - Colocarlas primero para evitar conflictos */}
          <Route path="/picker-login" element={<PickerLogin />} />
          <Route path="/picker-dashboard" element={<PickerDashboard />} />
          <Route path="/register" element={<Register />} />
          {/* Rutas Principales */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} /> {/* Alias por si acaso */}
          {/* Dashboards por Rol */}
          <Route path="/dashboard/padre" element={<PadreDashboard />} />
          <Route path="/dashboard/encargado" element={<EncargadoDashboard />} />
          <Route path="/dashboard/guardia" element={<GuardiaDashboard />} />
          <Route path="/dashboard/gestor" element={<GestorDashboard />} />
          <Route
            path="/dashboard/admin-escolar"
            element={<AdminEscolarDashboard />}
          />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
