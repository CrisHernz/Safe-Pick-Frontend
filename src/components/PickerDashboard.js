import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import QRCode from "qrcode";
import "./PickerDashboard.css";

function PickerDashboard() {
  const navigate = useNavigate();
  const [pickerData, setPickerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const loadPickerData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/picker-login");
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/withdrawals/picker/my-order`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("pickerData");
          navigate("/picker-login");
          return;
        }
        throw new Error("No se pudo cargar la información");
      }

      const data = await response.json();
      setPickerData(data);

      // Generar QR si existe el token y la orden está validada
      if (data.order?.qrCode && data.order?.status === "VALIDATED") {
        const qrUrl = await QRCode.toDataURL(data.order.qrCode, {
          width: 280,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });
        setQrDataUrl(qrUrl);
      }
    } catch (err) {
      setError(
        "No se pudo cargar la información. Tu sesión puede haber expirado.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadPickerData();

    // Actualizar cada 30 segundos para verificar cambios de estado
    const interval = setInterval(loadPickerData, 30000);
    return () => clearInterval(interval);
  }, [loadPickerData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pickerData");
    navigate("/picker-login");
  };

  // Loading State
  if (loading) {
    return (
      <div className="pk-loading">
        <div className="pk-loading-card">
          <div className="pk-spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="pk-error">
        <div className="pk-error-card">
          <div className="pk-error-icon">❌</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/picker-login")}
            className="pk-btn pk-btn-primary"
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
  const isExpired = picker.expiresAt && new Date(picker.expiresAt) < new Date();

  // Render based on order status
  return (
    <div className="pk-dashboard">
      {/* Header */}
      <header className="pk-header">
        <div className="pk-header-content">
          <div className="pk-header-info">
            <h1>SafePick</h1>
            <span className="pk-role-badge">Encargado Temporal</span>
          </div>
          <button onClick={handleLogout} className="pk-btn-logout">
            Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pk-main">
        {/* Completed State */}
        {order.status === "COMPLETED" && (
          <div className="pk-status-card pk-completed">
            <div className="pk-status-icon">🎉</div>
            <h2>¡Retiro Completado!</h2>
            <p>
              El retiro de <strong>{order.child.name}</strong> ha sido
              completado exitosamente.
            </p>
            <div className="pk-completion-info">
              <div className="pk-info-row">
                <span>Completado el:</span>
                <strong>
                  {new Date(order.withdrawalDate).toLocaleString("es-ES", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </strong>
              </div>
            </div>
            <p className="pk-status-hint">El padre/tutor ha sido notificado</p>
          </div>
        )}

        {/* Cancelled State */}
        {order.status === "CANCELLED" && (
          <div className="pk-status-card pk-cancelled">
            <div className="pk-status-icon">❌</div>
            <h2>Orden Cancelada</h2>
            <p>Esta orden de retiro ha sido cancelada por el padre/tutor.</p>
            <p className="pk-status-hint">
              Por favor, contacte al padre para más información
            </p>
          </div>
        )}

        {/* Expired State */}
        {isExpired && order.status === "VALIDATED" && (
          <div className="pk-status-card pk-expired">
            <div className="pk-status-icon">⏰</div>
            <h2>Código Expirado</h2>
            <p>El código temporal ha expirado.</p>
            <p className="pk-status-hint">
              Contacte al padre/tutor para obtener nuevas credenciales
            </p>
          </div>
        )}

        {/* Active QR State - Main View */}
        {order.status === "VALIDATED" && !isExpired && (
          <>
            {/* Child Info Card */}
            <div className="pk-info-card">
              <div className="pk-info-header">
                <div className="pk-child-avatar">👦</div>
                <div className="pk-child-info">
                  <h3>{order.child.name}</h3>
                  <span>
                    {order.child.grade}° Grado • {order.child.school}
                  </span>
                </div>
              </div>
              <div className="pk-divider"></div>
              <div className="pk-info-grid">
                <div className="pk-info-item">
                  <span className="pk-label">Tu nombre:</span>
                  <span className="pk-value">{picker.name}</span>
                </div>
                <div className="pk-info-item">
                  <span className="pk-label">Cédula:</span>
                  <span className="pk-value">{picker.cedula}</span>
                </div>
                <div className="pk-info-item">
                  <span className="pk-label">Relación:</span>
                  <span className="pk-value">{picker.relationship}</span>
                </div>
              </div>
            </div>

            {/* QR Code Card - Main Focus */}
            <div className="pk-qr-card">
              <h2>Tu Código QR</h2>
              <p>Presenta este código al guardia de seguridad</p>

              {qrDataUrl ? (
                <div className="pk-qr-container">
                  <img src={qrDataUrl} alt="Código QR" />
                </div>
              ) : (
                <div className="pk-qr-loading">
                  <div className="pk-spinner"></div>
                  <p>Generando QR...</p>
                </div>
              )}

              <div className="pk-qr-hint">
                <span>🔒</span>
                Este código está encriptado y solo puede ser verificado por el
                guardia
              </div>
            </div>

            {/* Expiry Warning */}
            {picker.expiresAt && (
              <div className="pk-expiry-warning">
                <span className="pk-expiry-icon">⏰</span>
                <div className="pk-expiry-text">
                  <strong>Válido hasta:</strong>
                  <span>
                    {new Date(picker.expiresAt).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="pk-instructions">
              <h3>Instrucciones para el Retiro</h3>
              <ol>
                <li>
                  Diríjase al colegio <strong>{order.child.school}</strong>
                </li>
                <li>Presente este código QR al guardia</li>
                <li>Muestre su cédula de identidad</li>
                <li>El guardia verificará los datos</li>
                <li>
                  Una vez aprobado, podrá retirar a{" "}
                  <strong>{order.child.name}</strong>
                </li>
              </ol>
            </div>

            {/* Parent Contact */}
            <div className="pk-contact-card">
              <h3>Contacto del Padre/Tutor</h3>
              <div className="pk-contact-info">
                <div className="pk-contact-item">
                  <span>👤</span>
                  <span>{order.parent.name}</span>
                </div>
                <div className="pk-contact-item">
                  <span>📞</span>
                  <a href={`tel:${order.parent.phone}`}>{order.parent.phone}</a>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pending State */}
        {order.status === "PENDING" && (
          <div className="pk-status-card pk-pending">
            <div className="pk-status-icon">⏳</div>
            <h2>Orden Pendiente</h2>
            <p>La orden de retiro aún no ha sido validada.</p>
            <p className="pk-status-hint">
              Por favor espere a que el sistema procese la orden
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default PickerDashboard;
