import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import Dashboard from "../components/Dashboard";
import CreateWithdrawal from "../components/CreateWithdrawal";
import PickerLogin from "../components/PickerLogin";
import PickerDashboard from "../components/PickerDashboard";
import GuardDashboard from "../components/GuardDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import { USER_ROLES } from "../config/api";

function AppRouter() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          }
        />

        {/* Login para pickers temporales */}
        <Route path="/picker-login" element={<PickerLogin />} />

        {/* Dashboard para pickers temporales */}
        <Route path="/picker-dashboard" element={<PickerDashboard />} />

        {/* Dashboard para guardias */}
        <Route
          path="/guard-dashboard"
          element={
            <ProtectedRoute
              component={GuardDashboard}
              allowedRoles={[USER_ROLES.GUARDIAN, USER_ROLES.ADMIN]}
            />
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              component={Dashboard}
              allowedRoles={[
                USER_ROLES.PARENT,
                USER_ROLES.GUARDIAN,
                USER_ROLES.ADMIN,
              ]}
            />
          }
        />
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
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
