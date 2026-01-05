import React from 'react';
import '../Login.css';
import './Dashboard.css';

export default function GuardiaDashboard() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Panel Guardia</h1>
        <p className="dashboard-subtitle">Modo de inicio de sesión: Guardia</p>
        <span className="role-badge">GUARDIA</span>
      </div>
    </div>
  );
}
