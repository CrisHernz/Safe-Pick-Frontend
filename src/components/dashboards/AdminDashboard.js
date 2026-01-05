import React from 'react';
import '../Login.css';
import './Dashboard.css';

export default function AdminDashboard() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Panel Administrador</h1>
        <p className="dashboard-subtitle">Modo de inicio de sesión: Administrador</p>
        <span className="role-badge">ADMIN</span>
      </div>
    </div>
  );
}
