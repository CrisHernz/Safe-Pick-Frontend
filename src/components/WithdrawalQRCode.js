import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import "./WithdrawalQRCode.css";

function WithdrawalQRCode({ qrToken, qrData, orderId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && qrToken) {
      // Generar QR en el canvas
      QRCode.toCanvas(canvasRef.current, qrToken, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      }).catch((err) => {
        console.error("Error generando QR:", err);
      });
    }
  }, [qrToken]);

  const downloadQR = () => {
    if (!qrToken || !qrData) return;

    QRCode.toDataURL(qrToken, {
      width: 600,
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `QR-${qrData.childName.replace(
          /\s/g,
          "_"
        )}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.error("Error descargando QR:", err);
        alert("Error al descargar el QR");
      });
  };

  const shareQR = async () => {
    if (!qrToken || !qrData) return;

    try {
      const dataUrl = await QRCode.toDataURL(qrToken, {
        width: 600,
        errorCorrectionLevel: "H",
      });

      // Convertir data URL a blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `QR-${qrData.childName}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Código QR - SafePick",
          text: `Código QR para recoger a ${qrData.childName}`,
          files: [file],
        });
      } else {
        // Fallback: copiar al portapapeles
        alert("Función de compartir no disponible. Use el botón de descarga.");
      }
    } catch (err) {
      console.error("Error compartiendo QR:", err);
    }
  };

  if (!qrToken || !qrData) {
    return <div className="qr-loading">Generando código QR...</div>;
  }

  return (
    <div className="qr-code-container">
      <div className="qr-header">
        <h3>✅ Orden de Retiro Creada</h3>
        <p className="qr-subtitle">Muestre este código QR en el colegio</p>
      </div>

      <div className="qr-canvas-wrapper">
        <canvas ref={canvasRef} className="qr-canvas" />
      </div>

      <div className="qr-info">
        <div className="info-section">
          <h4>👦 Niño</h4>
          <p>
            <strong>{qrData.childName}</strong>
          </p>
        </div>

        <div className="info-section">
          <h4>👤 Encargado de Recoger</h4>
          <p>
            <strong>Nombre:</strong> {qrData.pickerName}
          </p>
          <p>
            <strong>Cédula:</strong> {qrData.pickerCedula}
          </p>
          <p>
            <strong>Relación:</strong> {qrData.relationship}
          </p>
        </div>

        <div className="info-section">
          <h4>📋 Información de la Orden</h4>
          <p>
            <strong>ID:</strong> {orderId?.slice(0, 8)}...
          </p>
          <p>
            <strong>Creada:</strong>{" "}
            {new Date(qrData.createdAt).toLocaleString("es-ES")}
          </p>
        </div>
      </div>

      <div className="qr-actions">
        <button onClick={downloadQR} className="btn btn-primary">
          📥 Descargar QR
        </button>
        <button onClick={shareQR} className="btn btn-secondary">
          📤 Compartir
        </button>
      </div>

      <div className="qr-instructions">
        <p>
          💡 <strong>Instrucciones:</strong>
        </p>
        <ul>
          <li>Guarde o descargue este código QR</li>
          <li>Muéstrelo en el colegio al momento del retiro</li>
          <li>El encargado debe presentar su cédula para verificación</li>
        </ul>
      </div>
    </div>
  );
}

export default WithdrawalQRCode;
