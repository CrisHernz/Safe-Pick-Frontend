import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WithdrawalQRCode from "./WithdrawalQRCode";
import "./PickerDashboard.css";

function PickerDashboard() {
  const navigate = useNavigate();
  const [pickerData, setPickerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPickerData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/picker-login");
        return;
      }

      const response = await fetch(
        "http://localhost:3001/withdrawals/picker/my-order",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo cargar la información");
      }

      const data = await response.json();
      setPickerData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadPickerData();
  }, [loadPickerData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pickerData");
    navigate("/picker-login");
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: "Pendiente", class: "status-pending", icon: "⏳" },
      VALIDATED: { text: "Validada", class: "status-validated", icon: "✅" },
      COMPLETED: { text: "Completada", class: "status-completed", icon: "🎉" },
      CANCELLED: { text: "Cancelada", class: "status-cancelled", icon: "❌" },
    };
    return badges[status] || badges.PENDING;
  };

  if (loading) {
    return (
      <div className="picker-dashboard loading">
        <div className="spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="picker-dashboard error">
        <div className="error-card">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/picker-login")}
            className="btn btn-primary"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  if (!pickerData) {
    return null;
  }

  const { picker, order } = pickerData;
  const statusBadge = getStatusBadge(order.status);
  const isExpired = picker.expiresAt && new Date(picker.expiresAt) < new Date();

  return (
    <div className="picker-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>👋 Hola, {picker.name}</h1>
          <p className="role-badge">🎫 Picker Temporal</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          🚪 Salir
        </button>
      </div>

      <div className="dashboard-container">
        {/* Información del Picker */}
        <div className="info-card picker-info">
          <h2>📋 Tu Información</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{picker.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Cédula:</span>
              <span className="info-value">{picker.cedula}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{picker.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Relación:</span>
              <span className="info-value">{picker.relationship}</span>
            </div>
          </div>

          {picker.expiresAt && (
            <div className={`expiry-notice ${isExpired ? "expired" : ""}`}>
              <span className="icon">{isExpired ? "⚠️" : "⏰"}</span>
              <div>
                <strong>
                  {isExpired ? "Código Expirado" : "Válido hasta:"}
                </strong>
                <p>{new Date(picker.expiresAt).toLocaleString("es-ES")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Estado de la Orden */}
        <div className="info-card order-status">
          <div className="status-header">
            <h2>📦 Estado de la Orden</h2>
            <span className={`status-badge ${statusBadge.class}`}>
              {statusBadge.icon} {statusBadge.text}
            </span>
          </div>

          <div className="order-details">
            <h3>👦 Niño a Recoger</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{order.child.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Grado:</span>
                <span className="info-value">{order.child.grade}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Colegio:</span>
                <span className="info-value">{order.child.school}</span>
              </div>
            </div>

            <h3>👨‍👩‍👧 Padre/Tutor</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{order.parent.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Teléfono:</span>
                <span className="info-value">{order.parent.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{order.parent.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Código QR */}
        {order.qrCode && order.status === "VALIDATED" && !isExpired && (
          <div className="qr-section">
            <WithdrawalQRCode
              qrToken={order.qrCode}
              qrData={{
                orderId: order.id,
                childName: order.child.name,
                pickerName: picker.name,
                pickerCedula: picker.cedula,
                relationship: picker.relationship,
                createdAt: order.createdAt,
              }}
              orderId={order.id}
            />

            <div className="qr-instructions-card">
              <h3>📱 Instrucciones para el Retiro</h3>
              <ol>
                <li>
                  Diríjase al colegio <strong>{order.child.school}</strong>
                </li>
                <li>Muestre este código QR al personal de seguridad</li>
                <li>
                  Presente su cédula de identidad (
                  <strong>{picker.cedula}</strong>)
                </li>
                <li>El guardia escaneará el QR y verificará su identidad</li>
                <li>
                  Una vez aprobado, podrá retirar a{" "}
                  <strong>{order.child.name}</strong>
                </li>
              </ol>
            </div>
          </div>
        )}

        {order.status === "COMPLETED" && (
          <div className="completion-notice">
            <div className="icon">🎉</div>
            <h3>¡Retiro Completado!</h3>
            <p>La orden ha sido completada exitosamente.</p>
            <p className="completion-time">
              Completado el:{" "}
              {new Date(order.withdrawalDate).toLocaleString("es-ES")}
            </p>
          </div>
        )}

        {order.status === "CANCELLED" && (
          <div className="cancellation-notice">
            <div className="icon">❌</div>
            <h3>Orden Cancelada</h3>
            <p>Esta orden ha sido cancelada por el padre/tutor.</p>
          </div>
        )}

        {isExpired && order.status === "VALIDATED" && (
          <div className="expiry-alert">
            <div className="icon">⚠️</div>
            <h3>Código Expirado</h3>
            <p>
              El código temporal ha expirado. Por favor, contacte al padre/tutor
              para obtener uno nuevo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PickerDashboard;
