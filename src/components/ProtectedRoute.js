import React from "react";
import { useAuth } from "../hooks/useAuth";

/**
 * Componente que protege rutas requiriendo autenticación
 * @param {Object} props
 * @param {React.Component} props.component - Componente a renderizar
 * @param {string[]} props.allowedRoles - Roles permitidos (opcional)
 */
function ProtectedRoute({ component: Component, allowedRoles = null }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="unauthorized-container">
        <h1>No autorizado</h1>
        <p>Necesitas iniciar sesión para acceder a esta página.</p>
        <a href="/login">Ir a login</a>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="unauthorized-container">
        <h1>Acceso denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <a href="/dashboard">Volver al inicio</a>
      </div>
    );
  }

  return <Component />;
}

export default ProtectedRoute;
