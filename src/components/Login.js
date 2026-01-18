import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNormalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(email, password);

      console.log("Login response:", response); // Debug

      // Redirigir según el rol del usuario
      if (response.role === "GUARDIAN") {
        navigate("/dashboard/guardia");
      } else if (response.role === "ADMIN") {
        navigate("/dashboard/admin");
      } else if (response.role === "GESTOR") {
        navigate("/dashboard/gestor");
      } else if (response.role === "PARENT") {
        navigate("/dashboard/padre");
      } else {
        // Rol no reconocido - mostrar error
        setError(`El rol "${response.role || 'desconocido'}" no está registrado correctamente en el sistema. Por favor, contacte con soporte técnico.`);
        setLoading(false);
        return;
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

        <form onSubmit={handleNormalSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

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

        <div className="login-footer">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
          <p className="picker-login-link">
            ¿Eres un encargado temporal?{" "}
            <Link to="/picker-login">Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
