import "./App.css";
import Login from "./components/Login";
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
} from "./components/dashboards";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard/padre" element={<PadreDashboard />} />
          <Route path="/dashboard/encargado" element={<EncargadoDashboard />} />
          <Route path="/dashboard/guardia" element={<GuardiaDashboard />} />
          <Route
            path="/dashboard/admin-escolar"
            element={<AdminEscolarDashboard />}
          />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
