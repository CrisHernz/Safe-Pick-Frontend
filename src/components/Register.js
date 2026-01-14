import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PhoneInput from "./common/PhoneInput";
import "./Register.css";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cedula: "",
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) {
      clearError();
    }
  };

  const handlePhoneChange = (phoneValue) => {
    setFormData((prev) => ({ ...prev, phone: phoneValue }));
    if (validationErrors.phone) {
      setValidationErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Correo electronico invalido";
    }

    if (!PASSWORD_RULE.test(formData.password)) {
      errors.password =
        "La contrasena debe tener minimo 12 caracteres e incluir mayusculas, minusculas, numeros y simbolos";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contrasenas no coinciden";
    }

    if (!/^\d{8,13}$/.test(formData.cedula)) {
      errors.cedula = "La cedula debe tener entre 8 y 13 digitos";
    }

    if (!/^\+\d{10,15}$/.test(formData.phone)) {
      errors.phone = "Selecciona codigo y escribe un numero valido";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        cedula: formData.cedula,
        phone: formData.phone,
        role: "PARENT",
      });

      setSuccessMessage("Registro exitoso. Redirigiendo...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Error en registro", err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Crear cuenta SafePick</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Perez"
              disabled={loading}
              required
            />
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electronico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={loading}
              required
            />
            {validationErrors.email && (
              <span className="error-message">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cedula">Cedula</label>
            <input
              id="cedula"
              name="cedula"
              type="text"
              value={formData.cedula}
              onChange={(event) => {
                const onlyDigits = event.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "cedula", value: onlyDigits } });
              }}
              placeholder="12345678"
              disabled={loading}
              required
              maxLength={13}
            />
            {validationErrors.cedula && (
              <span className="error-message">{validationErrors.cedula}</span>
            )}
          </div>

          <PhoneInput
            label="Telefono del padre"
            id="parent-phone"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={loading}
            required
            helperText="Selecciona el pais y luego escribe solo los numeros"
            error={validationErrors.phone}
          />

          <div className="form-group">
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••"
              disabled={loading}
              required
            />
            <small className="input-hint">
              Minimo 12 caracteres, incluye mayuscula, minuscula, numero y
              simbolo
            </small>
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contrasena"
              disabled={loading}
              required
            />
            {validationErrors.confirmPassword && (
              <span className="error-message">
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="register-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
