/**
 * @fileoverview Componente de Login Principal
 * @module components/Login
 * @security AUTHENTICATION - Interfaz de autenticación de usuarios
 *
 * @description
 * Componente React para la autenticación de usuarios del sistema.
 * Maneja el flujo de login para padres, guardias, gestores y administradores.
 *
 * ## Seguridad Implementada:
 * - Validación de campos antes de envío
 * - Mensajes de error genéricos (sin revelar detalles)
 * - Inputs tipo password ocultan contenido
 * - Redirección basada en rol tras autenticación
 * - Estado de loading para prevenir múltiples envíos
 *
 * ## Flujo de Autenticación:
 * 1. Usuario ingresa email y contraseña
 * 2. Se envía a AuthContext.login()
 * 3. Si éxito, redirige según rol del usuario
 * 4. Si falla, muestra error genérico
 *
 * @see AuthContext - Contexto de autenticación
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

/**
 * Componente de formulario de login
 *
 * @returns {JSX.Element} Formulario de autenticación
 *
 * @security
 * - Input type="password" oculta caracteres
 * - Botón deshabilitado durante carga
 * - Mensaje de error no revela si usuario existe
 */
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
        setError("No se pudo acceder. Contacta con soporte.");
        setLoading(false);
        return;
      }
    } catch (err) {
      setError("Credenciales incorrectas o error de conexión.");
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
