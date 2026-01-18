import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";
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
    // Solo permitir números
    if (name === "cedula" || name === "temporaryCode") {
      if (!/^\d*$/.test(value)) return;
    }
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
      setError("Credenciales inválidas o código expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pkl-container">
      <div className="pkl-card">
        <div className="pkl-header">
          <h1>SafePick</h1>
          <span className="pkl-badge">Acceso Encargado</span>
        </div>

        <form onSubmit={handleSubmit} className="pkl-form">
          {error && (
            <div className="pkl-alert pkl-alert-error">
              <span>❌</span> {error}
            </div>
          )}

          <div className="pkl-form-group">
            <label htmlFor="cedula">Cédula de Identidad</label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              placeholder="Ej: 1234567890"
              required
              disabled={loading}
              maxLength="13"
              inputMode="numeric"
              autoComplete="off"
            />
            <span className="pkl-hint">
              Ingrese su número de cédula sin puntos ni guiones
            </span>
          </div>

          <div className="pkl-form-group">
            <label htmlFor="temporaryCode">Código Temporal</label>
            <input
              type="text"
              id="temporaryCode"
              name="temporaryCode"
              value={formData.temporaryCode}
              onChange={handleChange}
              placeholder="••••••"
              required
              disabled={loading}
              maxLength="6"
              inputMode="numeric"
              autoComplete="off"
              className="pkl-code-input"
            />
            <span className="pkl-hint">
              Código de 6 dígitos proporcionado por el padre
            </span>
          </div>

          <button
            type="submit"
            className="pkl-btn pkl-btn-primary"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <div className="pkl-info">
          <h3>ℹ️ Información importante</h3>
          <ul>
            <li>El código temporal es válido hasta las 2:00 PM</li>
            <li>Solo puede usarse para una orden de retiro</li>
            <li>Si tiene problemas, contacte al padre/tutor</li>
          </ul>
        </div>

        <button onClick={() => navigate("/login")} className="pkl-link">
          ← Volver al login principal
        </button>
      </div>
    </div>
  );
}

export default PickerLogin;
