import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./GuardDashboard.css";

function GuardDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Limpiar escáner al desmontar
  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current
          .clear()
          .catch((err) => console.error("Error al limpiar escáner:", err));
      }
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setScanResult(null);
    setError(null);
    setCompletedOrder(null);

    // Esperar a que el DOM se actualice
    setTimeout(() => {
      if (scannerRef.current && !html5QrcodeScannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(handleScanSuccess, handleScanError);
        html5QrcodeScannerRef.current = scanner;
      }
    }, 100);
  };

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current
        .clear()
        .then(() => {
          html5QrcodeScannerRef.current = null;
          setScanning(false);
        })
        .catch((err) => console.error("Error al detener escáner:", err));
    }
  };

  const handleScanSuccess = async (decodedText) => {
    console.log("QR escaneado:", decodedText);

    // Detener el escáner inmediatamente
    stopScanning();

    setLoading(true);
    setError(null);
    setScanResult(null);
    setCompletedOrder(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3001/withdrawals/guardian/scan-and-complete",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrToken: decodedText }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar el retiro");
      }

      console.log("Respuesta del servidor:", data);

      setCompletedOrder(data);
      setScanResult({
        success: true,
        message: "✅ Retiro completado exitosamente",
      });

      // Mostrar alerta de éxito
      if (data.notificationSent) {
        alert("✅ Retiro completado y padre notificado por Telegram");
      } else {
        alert("✅ Retiro completado (padre sin Telegram configurado)");
      }
    } catch (err) {
      console.error("Error al procesar QR:", err);

      const errorMessage = err.message || "Error desconocido al procesar el QR";

      setError(errorMessage);
      setScanResult({
        success: false,
        message: "❌ " + errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (errorMessage) => {
    // Ignorar errores de "No se encontró QR" (son normales durante el escaneo)
    if (errorMessage.includes("NotFoundException")) {
      return;
    }
    console.warn("Error del escáner:", errorMessage);
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setCompletedOrder(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="guard-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>🛡️ Dashboard Guardia</h1>
            <p>SafePick - Control de Retiros</p>
          </div>
          <div className="header-user">
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Procesando retiro...</p>
          </div>
        )}

        {!scanResult && !scanning && (
          <div className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-icon">📸</div>
              <h2>Listo para escanear</h2>
              <p>
                Haz clic en el botón para activar la cámara y escanear el código
                QR del retiro
              </p>
              <button
                onClick={startScanning}
                className="btn btn-primary btn-large"
              >
                🎥 Iniciar Escáner QR
              </button>
            </div>
          </div>
        )}

        {scanning && !scanResult && (
          <div className="scanner-section">
            <div className="scanner-card">
              <h2>📸 Escanear Código QR</h2>
              <p className="scanner-instructions">
                Posiciona el código QR dentro del marco de la cámara
              </p>

              <div ref={scannerRef} id="qr-reader" className="qr-reader"></div>

              <button
                onClick={stopScanning}
                className="btn btn-danger btn-large"
              >
                ⏹️ Detener Escáner
              </button>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="result-section">
            <div
              className={`result-card ${
                scanResult.success ? "success" : "error"
              }`}
            >
              <div className="result-icon">
                {scanResult.success ? "✅" : "❌"}
              </div>

              <h2>{scanResult.message}</h2>

              {completedOrder && (
                <div className="order-details">
                  <h3>📋 Detalles del Retiro</h3>

                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Niño/a:</span>
                      <span className="detail-value">
                        {completedOrder.order.child.name}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Grado:</span>
                      <span className="detail-value">
                        {completedOrder.order.child.grade}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Recogido por:</span>
                      <span className="detail-value">
                        {completedOrder.order.picker.name}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Relación:</span>
                      <span className="detail-value">
                        {completedOrder.order.picker.relationship}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Cédula:</span>
                      <span className="detail-value">
                        {completedOrder.order.picker.cedula}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Hora:</span>
                      <span className="detail-value">
                        {new Date(completedOrder.completionTime).toLocaleString(
                          "es-ES",
                          {
                            dateStyle: "long",
                            timeStyle: "short",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="notification-status">
                    {completedOrder.notificationSent ? (
                      <div className="notification-sent">
                        <span className="notification-icon">📱</span>
                        <div className="notification-text">
                          <strong>Padre notificado</strong>
                          <span>Mensaje enviado por Telegram</span>
                        </div>
                      </div>
                    ) : (
                      <div className="notification-not-sent">
                        <span className="notification-icon">⚠️</span>
                        <div className="notification-text">
                          <strong>Sin notificación</strong>
                          <span>Padre no tiene Telegram configurado</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="error-details">
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={resetScanner}
                className="btn btn-primary btn-large"
              >
                🔄 Escanear Otro QR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GuardDashboard;
