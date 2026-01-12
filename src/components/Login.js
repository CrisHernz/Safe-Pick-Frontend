import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.service";
import authService from "../services/auth.service";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

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

        <p className="login-footer">
          ¿No tienes cuenta? <a href="#register">Regístrate</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
