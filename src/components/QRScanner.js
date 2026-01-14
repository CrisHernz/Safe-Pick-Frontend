import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./QRScanner.css";

function QRScanner({ onScanSuccess, onScanError }) {
  const [scanning, setScanning] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (scanning && scannerRef.current && !html5QrcodeScannerRef.current) {
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

      scanner.render(onScanSuccess || handleScan, onScanError || handleError);
      html5QrcodeScannerRef.current = scanner;
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
        html5QrcodeScannerRef.current = null;
      }
    };
  }, [scanning]);

  const handleScan = async (decodedText) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/withdrawals/validate-qr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ qrToken: decodedText }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al validar el QR");
      }

      setValidationData(data);
      setScanning(false);

      // Limpiar el scanner
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
        html5QrcodeScannerRef.current = null;
      }
    } catch (err) {
      setError(err.message || "QR inválido o error de conexión");
      console.error("Error validando QR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    // Ignorar errores de escaneo normal (no encontrar QR)
    if (err.includes("NotFoundException")) return;
    console.warn("Error de escaneo:", err);
  };

  const handleComplete = async () => {
    if (!validationData?.order?.id) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/withdrawals/${validationData.order.id}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al completar el retiro");
      }

      alert("✅ Retiro completado exitosamente");
      setValidationData(null);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al completar el retiro");
      alert("❌ Error al completar el retiro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setValidationData(null);
    setError(null);
    setScanning(false);
    setLoading(false);
  };

  return (
    <div className="qr-scanner-container">
      <div className="scanner-header">
        <h2>📷 Escanear QR de Retiro</h2>
        <p>Apunte la cámara al código QR para validar la orden</p>
      </div>

      {!scanning && !validationData && (
        <div className="scanner-start">
          <button
            onClick={() => setScanning(true)}
            className="btn btn-primary btn-lg"
          >
            🎥 Iniciar Escáner
          </button>
        </div>
      )}

      {scanning && (
        <div className="scanner-wrapper">
          <div id="qr-reader" ref={scannerRef}></div>
          {loading && (
            <div className="scanner-overlay">
              <div className="spinner"></div>
              <p>Validando QR...</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <strong>❌ Error:</strong> {error}
          <button onClick={resetScanner} className="btn-close">
            ×
          </button>
        </div>
      )}

      {validationData && (
        <div className="validation-result">
          <div className="result-header">
            <h3>✅ QR Válido</h3>
            <p className="result-message">{validationData.message}</p>
          </div>

          <div className="info-grid">
            <div className="info-card">
              <h4>👦 Información del Niño</h4>
              <div className="info-content">
                <p>
                  <strong>Nombre:</strong> {validationData.order.child.name}
                </p>
                <p>
                  <strong>Grado:</strong> {validationData.order.child.grade}
                </p>
                <p>
                  <strong>Colegio:</strong> {validationData.order.child.school}
                </p>
              </div>
            </div>

            <div className="info-card highlight">
              <h4>👤 Encargado de Recoger</h4>
              <div className="info-content">
                <p>
                  <strong>Nombre:</strong> {validationData.order.picker.name}
                </p>
                <p>
                  <strong>Cédula:</strong> {validationData.order.picker.cedula}
                </p>
                <p>
                  <strong>Teléfono:</strong> {validationData.order.picker.phone}
                </p>
                <p>
                  <strong>Relación:</strong>{" "}
                  {validationData.order.picker.relationship}
                </p>
              </div>
            </div>

            <div className="info-card">
              <h4>👨‍👩‍👧 Padre/Tutor</h4>
              <div className="info-content">
                <p>
                  <strong>Nombre:</strong> {validationData.order.parent.name}
                </p>
                <p>
                  <strong>Teléfono:</strong> {validationData.order.parent.phone}
                </p>
                <p>
                  <strong>Email:</strong> {validationData.order.parent.email}
                </p>
              </div>
            </div>
          </div>

          <div className="verification-warning">
            <p>
              ⚠️ <strong>IMPORTANTE:</strong> Verifique la identidad del
              encargado antes de continuar
            </p>
            <ul>
              <li>
                Solicite la cédula y verifique que coincida con:{" "}
                <strong>{validationData.order.picker.cedula}</strong>
              </li>
              <li>
                Confirme que la persona es:{" "}
                <strong>{validationData.order.picker.name}</strong>
              </li>
            </ul>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="btn btn-success btn-lg"
            >
              {loading ? "Procesando..." : "✅ Completar Retiro"}
            </button>
            <button
              onClick={resetScanner}
              disabled={loading}
              className="btn btn-secondary"
            >
              🔄 Escanear Otro QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
