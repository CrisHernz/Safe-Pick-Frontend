import React from 'react';
import '../Login.css';
import './Dashboard.css';

export default function PadreDashboard() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Panel Padre</h1>
        <p className="dashboard-subtitle">Modo de inicio de sesión: Padre</p>
        <span className="role-badge">PADRE</span>
      </div>
    </div>
  );
}
