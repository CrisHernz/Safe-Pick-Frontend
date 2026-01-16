import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import PadreDashboard from "../components/dashboards/PadreDashboard";
import AdminDashboard from "../components/dashboards/AdminDashboard";
import GestorDashboard from "../components/dashboards/GestorDashboard";
import CreateWithdrawal from "../components/CreateWithdrawal";
import PickerLogin from "../components/PickerLogin";
import PickerDashboard from "../components/PickerDashboard";
import GuardDashboard from "../components/GuardDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../config/api";

function AppRouter() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
        }}
      >
        <p>Cargando...</p>
      </div>
    );
  }

  // Función para redirigir según el rol
  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return "/login";

    switch (user.role) {
      case "GUARDIAN":
        return "/dashboard/guardia";
      case "ADMIN":
        return "/dashboard/admin";
      case "GESTOR":
        return "/dashboard/gestor";
      case "PARENT":
      default:
        return "/dashboard/padre";
    }
  };

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Register />
          }
        />

        {/* Login para pickers temporales */}
        <Route path="/picker-login" element={<PickerLogin />} />

        {/* Dashboard para pickers temporales */}
        <Route path="/picker-dashboard" element={<PickerDashboard />} />

        {/* Dashboard para guardias */}
        <Route
          path="/dashboard/guardia"
          element={
            <ProtectedRoute
              component={GuardDashboard}
              allowedRoles={[USER_ROLES.GUARDIAN, USER_ROLES.ADMIN]}
            />
          }
        />

        {/* Dashboard para padres */}
        <Route
          path="/dashboard/padre"
          element={
            <ProtectedRoute
              component={PadreDashboard}
              allowedRoles={[
                USER_ROLES.PARENT,
                USER_ROLES.GUARDIAN,
                USER_ROLES.ADMIN,
              ]}
            />
          }
        />

        {/* Dashboard Admin */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute
              component={AdminDashboard}
              allowedRoles={[USER_ROLES.ADMIN]}
            />
          }
        />

        {/* Dashboard Gestor */}
        <Route
          path="/dashboard/gestor"
          element={
            <ProtectedRoute
              component={GestorDashboard}
              allowedRoles={[USER_ROLES.GESTOR]}
            />
          }
        />

        {/* Dashboard genérico - redirige según rol */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta para crear retiro */}
        <Route
          path="/withdraw/:childId"
          element={
            <ProtectedRoute
              component={CreateWithdrawal}
              allowedRoles={[USER_ROLES.PARENT, USER_ROLES.GUARDIAN]}
            />
          }
        />

        {/* Ruta por defecto */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
