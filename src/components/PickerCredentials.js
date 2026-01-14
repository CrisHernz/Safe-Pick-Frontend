import React from "react";
import WithdrawalQRCode from "./WithdrawalQRCode";
import "./PickerCredentials.css";

function PickerCredentials({ pickerCredentials, qrToken, qrData, orderId }) {
  // Defensive check
  if (!pickerCredentials) {
    return null;
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`${field} copiado al portapapeles`);
      })
      .catch(() => {
        alert("Error al copiar");
      });
  };

  const shareCredentials = () => {
    const message = `🎫 Credenciales de Acceso - SafePick

👤 Cédula: ${pickerCredentials.cedula}
🔑 Código Temporal: ${pickerCredentials.temporaryCode}
⏰ Válido hasta: ${new Date(pickerCredentials.expiresAt).toLocaleString(
      "es-ES"
    )}

📱 Accede en: http://localhost:3000/picker-login

⚠️ Importante:
- Este código es personal e intransferible
- Solo puede usarse una vez
- Válido por 24 horas`;

    if (navigator.share) {
      navigator
        .share({
          title: "Credenciales SafePick",
          text: message,
        })
        .catch(console.error);
    } else {
      copyToClipboard(message, "Credenciales");
    }
  };

  return (
    <div className="picker-credentials-container">
      <div className="credentials-card">
        <div className="card-header">
          <h2>🎫 Credenciales Temporales</h2>
          <p>Comparta estas credenciales con la persona que recogerá al niño</p>
        </div>

        <div className="credentials-info">
          <div className="credential-item important">
            <div className="credential-label">
              <span className="icon">🆔</span>
              <span>Cédula de Identidad</span>
            </div>
            <div className="credential-value-wrapper">
              <span className="credential-value">
                {pickerCredentials.cedula}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(pickerCredentials.cedula, "Cédula")
                }
                className="btn-copy"
                title="Copiar"
              >
                📋
              </button>
            </div>
          </div>

          <div className="credential-item important">
            <div className="credential-label">
              <span className="icon">🔑</span>
              <span>Código Temporal</span>
            </div>
            <div className="credential-value-wrapper">
              <span className="credential-value code">
                {pickerCredentials.temporaryCode}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(pickerCredentials.temporaryCode, "Código")
                }
                className="btn-copy"
                title="Copiar"
              >
                📋
              </button>
            </div>
          </div>

          <div className="credential-item">
            <div className="credential-label">
              <span className="icon">⏰</span>
              <span>Válido hasta</span>
            </div>
            <div className="credential-value-wrapper">
              <span className="credential-value">
                {new Date(pickerCredentials.expiresAt).toLocaleString("es-ES")}
              </span>
            </div>
          </div>

          <div className="credential-item">
            <div className="credential-label">
              <span className="icon">🌐</span>
              <span>URL de Acceso</span>
            </div>
            <div className="credential-value-wrapper">
              <span className="credential-value url">
                http://localhost:3000/picker-login
              </span>
              <button
                onClick={() =>
                  copyToClipboard("http://localhost:3000/picker-login", "URL")
                }
                className="btn-copy"
                title="Copiar"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="actions">
          <button onClick={shareCredentials} className="btn btn-primary">
            📤 Compartir Credenciales
          </button>
        </div>

        <div className="instructions">
          <h3>📝 Instrucciones para el Picker</h3>
          <ol>
            <li>
              Acceder a <strong>http://localhost:3000/picker-login</strong>
            </li>
            <li>
              Ingresar su <strong>cédula</strong> y el{" "}
              <strong>código temporal</strong>
            </li>
            <li>Una vez dentro, podrá ver el código QR para el retiro</li>
            <li>Presentar el QR y su cédula en el colegio</li>
          </ol>
        </div>

        <div className="warning-box">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <strong>Importante:</strong>
            <ul>
              <li>Guarde estas credenciales en un lugar seguro</li>
              <li>No comparta el código con personas no autorizadas</li>
              <li>El código expira en 24 horas</li>
              <li>Solo puede usarse para esta orden de retiro</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mostrar también el QR para el padre */}
      <div className="parent-qr-section">
        <h2>📱 Tu Código QR (Vista de Padre)</h2>
        <p>También puedes usar este QR directamente si vas tú al colegio</p>
        <WithdrawalQRCode qrToken={qrToken} qrData={qrData} orderId={orderId} />
      </div>
    </div>
  );
}

export default PickerCredentials;
