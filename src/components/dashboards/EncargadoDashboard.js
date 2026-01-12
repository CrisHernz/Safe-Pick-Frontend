import React from "react";
import Navbar from "../common/Navbar";
import Card from "../common/Card";
import authService from "../../services/auth.service";
import "./Dashboard.css";

export default function EncargadoDashboard() {
  const user = authService.getUser();

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Bienvenido</h1>
            <p className="dashboard-subtitle">Panel de Persona Autorizada</p>
          </div>
        </div>

        <div className="grid-2">
          <Card title="Tu Información">
            <div className="role-stats">
              <div className="role-stat-item">
                <span className="role-stat-label">Nombre Completo</span>
                <span className="role-stat-value">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <div className="role-stat-item">
                <span className="role-stat-label">Email</span>
                <span className="role-stat-value">{user?.email}</span>
              </div>
              <div className="role-stat-item">
                <span className="role-stat-label">Rol</span>
                <span className="role-stat-value">Persona Autorizada</span>
              </div>
            </div>
          </Card>

          <Card title="Instrucciones">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div className="alert alert-info">
                <strong>📱 Paso 1:</strong> El padre/madre debe generar un
                código QR desde su panel.
              </div>
              <div className="alert alert-info">
                <strong>🎫 Paso 2:</strong> Recibirá el código QR por WhatsApp o
                correo electrónico.
              </div>
              <div className="alert alert-info">
                <strong>🏫 Paso 3:</strong> Presente el código QR y su DNI al
                guardia de seguridad en la institución.
              </div>
              <div className="alert alert-info">
                <strong>✅ Paso 4:</strong> El guardia validará el código y
                autorizará el retiro del estudiante.
              </div>
            </div>
          </Card>
        </div>

        <Card title="Información Importante">
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--gray-700)",
              lineHeight: "1.6",
            }}
          >
            <p style={{ marginBottom: "12px" }}>
              <strong>
                Como persona autorizada, puedes retirar estudiantes solo cuando:
              </strong>
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "16px" }}>
              <li>
                El padre/madre ha generado un código QR válido a tu nombre
              </li>
              <li>El código QR no ha expirado (válido por 24 horas)</li>
              <li>
                Presentas tu DNI que coincide con el registrado en el sistema
              </li>
              <li>El estudiante está registrado y activo en el sistema</li>
            </ul>
            <p style={{ marginBottom: "12px" }}>
              <strong>Recuerda:</strong>
            </p>
            <ul style={{ marginLeft: "20px" }}>
              <li>Siempre lleva tu DNI original al momento del retiro</li>
              <li>Los códigos QR son de un solo uso</li>
              <li>No compartas tus códigos QR con otras personas</li>
              <li>
                Si tienes problemas, contacta al padre/madre o a la
                administración escolar
              </li>
            </ul>
          </div>
        </Card>

        <Card title="¿Necesitas Ayuda?">
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ marginBottom: "16px", color: "var(--gray-600)" }}>
              Si tienes dudas o problemas con el proceso de retiro, contacta a:
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button className="btn btn-primary">
                📞 Llamar a la Institución
              </button>
              <button className="btn btn-secondary">📧 Enviar Correo</button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
