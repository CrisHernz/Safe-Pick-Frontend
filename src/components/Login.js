import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import apiService from "../services/api.service";
import authService from "../services/auth.service";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
=======
import { useAuth } from "../hooks/useAuth";
import { validation } from "../utils/validation";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  // Estados para login normal
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [validationErrors, setValidationErrors] = useState({});

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const validateNormalForm = () => {
    const errors = {};

    if (!validation.isValidEmail(email)) {
      errors.email = "Email inválido";
    }

    if (!password) {
      errors.password = "La contraseña es requerida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
>>>>>>> Stashed changes

  const handleNormalSubmit = async (e) => {
    e.preventDefault();
<<<<<<< Updated upstream
    setLoading(true);
    setError("");

    try {
      const data = await apiService.login(email, password);

      // Guardar datos de autenticación
      authService.saveAuth(data);

      console.log("Login exitoso:", data);

      // Redirigir según el rol
      const role = data?.user?.role;
      const roleToPath = {
        PADRE: "/dashboard/padre",
        ENCARGADO: "/dashboard/encargado",
        GUARDIA: "/dashboard/guardia",
        ADMIN_ESCOLAR: "/dashboard/admin-escolar",
        ADMIN: "/dashboard/admin",
      };
      if (role && roleToPath[role]) {
        navigate(roleToPath[role]);
=======
    clearError();

    if (!validateNormalForm()) {
      return;
    }

    try {
      const response = await login(email, password);

      // Redirigir según el rol del usuario
      if (response.role === "GUARDIAN") {
        navigate("/guard-dashboard");
      } else if (response.role === "ADMIN") {
        navigate("/guard-dashboard"); // Admin también puede ser guardia
      } else {
        navigate("/dashboard");
>>>>>>> Stashed changes
      }
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor");
      console.error("Error en login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">SafePick</h1>

<<<<<<< Updated upstream
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
=======
        {/* Formulario de login normal */}
        <form onSubmit={handleNormalSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}
>>>>>>> Stashed changes

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

<<<<<<< Updated upstream
        <p className="login-footer">
          ¿No tienes cuenta? <a href="#register">Regístrate</a>
        </p>
=======
        <div className="login-footer">
          <p>
            ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
          </p>
          <p className="picker-login-link">
            ¿Eres un encargado temporal?{" "}
            <a href="/picker-login">Ingresa aquí</a>
          </p>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
}

export default Login;
