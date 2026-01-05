import React from 'react';
import '../Login.css';
import './Dashboard.css';

export default function EncargadoDashboard() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Panel Encargado</h1>
        <p className="dashboard-subtitle">Modo de inicio de sesión: Encargado</p>
        <span className="role-badge">ENCARGADO</span>
      </div>
    </div>
  );
}
