import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PickerLogin.css";

function PickerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cedula: "",
    temporaryCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login-picker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el inicio de sesión");
      }

      // Guardar token y datos del picker
      localStorage.setItem("token", data.token);
      localStorage.setItem("pickerData", JSON.stringify(data));

      // Redirigir al dashboard del picker
      navigate("/picker-dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="picker-login-container">
      <div className="picker-login-card">
        <div className="login-header">
          <h1>🎫 Acceso Picker</h1>
          <p>Ingrese sus credenciales temporales</p>
        </div>

        <form onSubmit={handleSubmit} className="picker-login-form">
          {error && <div className="alert alert-error">❌ {error}</div>}

          <div className="form-group">
            <label htmlFor="cedula">
              <span className="label-icon">🆔</span>
              Cédula de Identidad
            </label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              placeholder="Ej: 1234567890"
              required
              disabled={loading}
              pattern="[0-9]{8,13}"
              title="Debe ser un número de 8 a 13 dígitos"
            />
            <small className="input-hint">
              Ingrese su número de cédula sin puntos ni guiones
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="temporaryCode">
              <span className="label-icon">🔑</span>
              Código Temporal
            </label>
            <input
              type="text"
              id="temporaryCode"
              name="temporaryCode"
              value={formData.temporaryCode}
              onChange={handleChange}
              placeholder="Ej: 123456"
              required
              disabled={loading}
              pattern="[0-9]{6}"
              title="Debe ser un código de 6 dígitos"
              maxLength="6"
            />
            <small className="input-hint">
              Código de 6 dígitos proporcionado por el padre/tutor
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? "⏳ Iniciando sesión..." : "🚀 Ingresar"}
          </button>
        </form>

        <div className="login-footer">
          <div className="info-box">
            <p>
              ℹ️ <strong>Información importante:</strong>
            </p>
            <ul>
              <li>El código temporal tiene una validez de 24 horas</li>
              <li>Solo puede usarse para una orden de retiro</li>
              <li>Si tiene problemas, contacte al padre/tutor</li>
            </ul>
          </div>

          <button onClick={() => navigate("/login")} className="btn-link">
            ← Volver al login principal
          </button>
        </div>
      </div>
    </div>
  );
}

export default PickerLogin;
