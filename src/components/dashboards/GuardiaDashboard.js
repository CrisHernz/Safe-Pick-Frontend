import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { API_CONFIG } from "../../config/api";
import { useNavigate } from "react-router-dom";
import "./GuardiaDashboard.css";

function GuardDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [step, setStep] = useState("idle"); // idle, scanning, validating, verified, completed, error
  const [idConfirmed, setIdConfirmed] = useState(false);

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

  // Detener escáner
  const stopScanning = useCallback(() => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current
        .clear()
        .then(() => {
          html5QrcodeScannerRef.current = null;
        })
        .catch((err) => console.error("Error al detener escáner:", err));
    }
  }, []);

  // Manejar errores de escaneo
  const handleScanError = useCallback((scanError) => {
    // Librería lanza muchos errores mientras busca un QR; solo mostramos cuando no se trata de ausencia
    if (
      typeof scanError === "string" &&
      scanError.includes("NotFoundException")
    ) {
      return;
    }
    if (
      typeof scanError === "object" &&
      scanError?.name === "NotFoundException"
    ) {
      return;
    }
    console.warn("Advertencia de escaneo:", scanError);
  }, []);

  // Manejar escaneo exitoso
  const handleScanSuccess = useCallback(
    async (qrToken) => {
      console.log("QR escaneado, procesando...");

      // Detener escáner
      stopScanning();
      setStep("validating");
      setLoading(true);
      setError(null);

      try {
        // Validar con el backend (que tiene la llave de encriptación)
        const token = localStorage.getItem("token");

        const validateResponse = await fetch(
          `${API_CONFIG.BASE_URL}/withdrawals/validate-qr`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ qrToken }),
          }
        );

        const validateData = await validateResponse.json();

        if (!validateResponse.ok) {
          throw new Error(
            validateData.message || "QR inválido o no autorizado"
          );
        }

        // QR válido - mostrar información desencriptada enviada por el backend
        setDecodedData({
          raw: qrToken,
          validated: validateData,
        });
        setIdConfirmed(false);
        setStep("verified");
      } catch (err) {
        console.error("Error al validar QR:", err);
        setError(err.message || "Error al procesar el código QR");
        setStep("error");
      } finally {
        setLoading(false);
      }
    },
    [stopScanning]
  );

  // Iniciar escáner QR
  const startScanning = useCallback(() => {
    setStep("scanning");
    setError(null);
    setDecodedData(null);
    setCompletedOrder(null);
    setIdConfirmed(false);

    setTimeout(() => {
      if (scannerRef.current && !html5QrcodeScannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
            videoConstraints: {
              facingMode: { ideal: "environment" },
            },
          },
          /* verbose= */ false
        );

        scanner.render(handleScanSuccess, handleScanError);
        html5QrcodeScannerRef.current = scanner;
      }
    }, 100);
  }, [handleScanError, handleScanSuccess]);

  // Completar el retiro
  const handleCompleteWithdrawal = async () => {
    if (!decodedData?.raw) return;
    if (!idConfirmed) {
      setError("Confirma la cédula del encargado antes de continuar");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Llamar al endpoint que completa el retiro Y envía notificación Telegram
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/withdrawals/guardian/scan-and-complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrToken: decodedData.raw }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al completar el retiro");
      }

      // Éxito - mostrar resultado
      setCompletedOrder(data);
      setStep("completed");
    } catch (err) {
      console.error("Error al completar retiro:", err);
      setError(err.message || "Error al completar el retiro");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar escáner
  const resetScanner = () => {
    setStep("idle");
    setDecodedData(null);
    setCompletedOrder(null);
    setError(null);
    setLoading(false);
    setIdConfirmed(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="gd-dashboard">
      {/* Header */}
      <header className="gd-header">
        <div className="gd-header-content">
          <div className="gd-header-info">
            <h1>SafePick</h1>
            <span className="gd-role-badge">🛡️ Guardia</span>
          </div>
          <div className="gd-header-user">
            <span className="gd-user-name">{user?.name}</span>
            <button onClick={handleLogout} className="gd-btn-logout">
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="gd-main">
        {/* Loading Overlay */}
        {loading && (
          <div className="gd-loading-overlay">
            <div className="gd-spinner-large"></div>
            <p>
              {step === "validating" ? "Validando código..." : "Procesando..."}
            </p>
          </div>
        )}

        {/* Step: Idle - Welcome Screen */}
        {step === "idle" && (
          <div className="gd-welcome">
            <div className="gd-welcome-card">
              <div className="gd-welcome-icon">📸</div>
              <h2>Control de Retiros</h2>
              <p>
                Escanea el código QR del encargado para verificar y completar el
                retiro
              </p>
              <button
                onClick={startScanning}
                className="gd-btn gd-btn-primary gd-btn-large"
              >
                🎥 Iniciar Escáner
              </button>
            </div>

            <div className="gd-instructions-card">
              <h3>Proceso de Verificación</h3>
              <ol>
                <li>El encargado muestra el código QR</li>
                <li>Escanea el código con la cámara</li>
                <li>Verifica los datos del niño y encargado</li>
                <li>Solicita cédula de identidad al encargado</li>
                <li>Confirma el retiro para notificar al padre</li>
              </ol>
            </div>
          </div>
        )}

        {/* Step: Scanning */}
        {step === "scanning" && (
          <div className="gd-scanner-section">
            <div className="gd-scanner-card">
              <h2>📸 Escaneando QR</h2>
              <p>Posiciona el código QR dentro del marco</p>

              <div className="gd-scanner-wrapper">
                <div ref={scannerRef} id="qr-reader"></div>
              </div>

              <button onClick={stopScanning} className="gd-btn gd-btn-danger">
                ⏹️ Cancelar Escaneo
              </button>
            </div>
          </div>
        )}

        {/* Step: Verified - Show Data */}
        {step === "verified" && decodedData?.validated && (
          <div className="gd-verified-section">
            <div className="gd-status-banner gd-status-success">
              <span>✅</span>
              <div>
                <strong>QR Válido</strong>
                <p>Los datos han sido verificados correctamente</p>
              </div>
            </div>

            {/* Child Info */}
            <div className="gd-info-card">
              <h3>👦 Niño a Retirar</h3>
              <div className="gd-info-grid">
                <div className="gd-info-item">
                  <span className="gd-label">Nombre:</span>
                  <span className="gd-value">
                    {decodedData.validated.order.child.name}
                  </span>
                </div>
                <div className="gd-info-item">
                  <span className="gd-label">Grado:</span>
                  <span className="gd-value">
                    {decodedData.validated.order.child.grade}
                  </span>
                </div>
                <div className="gd-info-item">
                  <span className="gd-label">Colegio:</span>
                  <span className="gd-value">
                    {decodedData.validated.order.child.school}
                  </span>
                </div>
              </div>
            </div>

            {/* Picker Info - Important! */}
            <div className="gd-info-card gd-highlight">
              <h3>👤 Encargado de Recoger</h3>
              <div className="gd-info-grid">
                <div className="gd-info-item">
                  <span className="gd-label">Nombre:</span>
                  <span className="gd-value gd-important">
                    {decodedData.validated.order.picker.name}
                  </span>
                </div>
                <div className="gd-info-item">
                  <span className="gd-label">Cédula:</span>
                  <span className="gd-value gd-mono gd-important">
                    {decodedData.validated.order.picker.cedula}
                  </span>
                </div>
                <div className="gd-info-item">
                  <span className="gd-label">Relación:</span>
                  <span className="gd-value">
                    {decodedData.validated.order.picker.relationship}
                  </span>
                </div>
                <div className="gd-info-item">
                  <span className="gd-label">Teléfono:</span>
                  <span className="gd-value">
                    {decodedData.validated.order.picker.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Parent Info */}
            <div className="gd-info-card">
              <h3>👨‍👩‍👧 Padre/Tutor</h3>
              <div className="gd-info-grid">
                <div className="gd-info-item">
                  <span className="gd-label">Nombre:</span>
                  <span className="gd-value">
                    {decodedData.validated.order.parent.name}
                  </span>
                </div>
                <div className="gd-info-item">
                  <span className="gd-label">Teléfono:</span>
                  <span className="gd-value">
                    {decodedData.validated.order.parent.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Reminder */}
            <div className="gd-alert gd-alert-warning">
              <span>⚠️</span>
              <div>
                <strong>Verificación de Identidad</strong>
                <p>
                  Solicite la cédula de identidad al encargado y compare con los
                  datos mostrados antes de confirmar.
                </p>
              </div>
            </div>

            <div className="gd-confirm-check">
              <label>
                <input
                  type="checkbox"
                  checked={idConfirmed}
                  onChange={(event) => setIdConfirmed(event.target.checked)}
                />
                Confirmé que los datos del documento coinciden con el QR
              </label>
            </div>

            {/* Action Buttons */}
            <div className="gd-actions">
              <button
                onClick={resetScanner}
                className="gd-btn gd-btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteWithdrawal}
                className="gd-btn gd-btn-success gd-btn-large"
                disabled={!idConfirmed || loading}
              >
                ✅ Confirmar Retiro
              </button>
            </div>
          </div>
        )}

        {/* Step: Completed */}
        {step === "completed" && completedOrder && (
          <div className="gd-completed-section">
            <div className="gd-completed-card">
              <div className="gd-completed-icon">🎉</div>
              <h2>¡Retiro Completado!</h2>
              <p>El retiro ha sido registrado exitosamente</p>

              <div className="gd-completed-details">
                <div className="gd-detail-row">
                  <span>Niño:</span>
                  <strong>{completedOrder.order.child.name}</strong>
                </div>
                <div className="gd-detail-row">
                  <span>Recogido por:</span>
                  <strong>{completedOrder.order.picker.name}</strong>
                </div>
                <div className="gd-detail-row">
                  <span>Hora:</span>
                  <strong>
                    {new Date(completedOrder.completionTime).toLocaleString(
                      "es-ES",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    )}
                  </strong>
                </div>
              </div>

              {/* Notification Status */}
              <div
                className={`gd-notification-status ${
                  completedOrder.notificationSent ? "gd-sent" : "gd-not-sent"
                }`}
              >
                {completedOrder.notificationSent ? (
                  <>
                    <span className="gd-notif-icon">📱</span>
                    <div>
                      <strong>Padre Notificado</strong>
                      <p>Se envió notificación por Telegram</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="gd-notif-icon">⚠️</span>
                    <div>
                      <strong>Sin Notificación</strong>
                      <p>El padre no tiene Telegram configurado</p>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={resetScanner}
                className="gd-btn gd-btn-primary gd-btn-large"
              >
                🔄 Escanear Otro QR
              </button>
            </div>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="gd-error-section">
            <div className="gd-error-card">
              <div className="gd-error-icon">❌</div>
              <h2>Error en Verificación</h2>
              <p className="gd-error-message">{error}</p>

              <div className="gd-error-hint">
                <p>Posibles causas:</p>
                <ul>
                  <li>El código QR no es válido</li>
                  <li>La orden ya fue completada o cancelada</li>
                  <li>El código temporal ha expirado</li>
                </ul>
              </div>

              <button
                onClick={resetScanner}
                className="gd-btn gd-btn-primary gd-btn-large"
              >
                🔄 Intentar de Nuevo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default GuardDashboard;
