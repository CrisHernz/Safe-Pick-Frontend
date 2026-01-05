import React from 'react';
import '../Login.css';
import './Dashboard.css';

export default function AdminEscolarDashboard() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Panel Admin Escolar</h1>
        <p className="dashboard-subtitle">Modo de inicio de sesión: Admin Escolar</p>
        <span className="role-badge">ADMIN_ESCOLAR</span>
      </div>
    </div>
  );
}
