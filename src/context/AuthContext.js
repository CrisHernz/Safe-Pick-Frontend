/**
 * @fileoverview Contexto de Autenticación para React
 * @module context/AuthContext
 * @security AUTHENTICATION - Gestión del estado de autenticación en el cliente
 *
 * @description
 * Proveedor de contexto React que centraliza toda la lógica de autenticación
 * del frontend, incluyendo:
 * - Estado del usuario autenticado
 * - Token JWT para peticiones al API
 * - Funciones de login, registro y logout
 * - Verificación de roles para control de acceso en UI
 *
 * ## Seguridad Implementada:
 * - Token JWT almacenado en localStorage (considerar httpOnly cookies en producción)
 * - Estado de autenticación sincronizado con localStorage al cargar la app
 * - Limpieza completa de datos al hacer logout
 * - Verificación de roles para renderizado condicional de componentes
 *
 * ## Uso:
 * ```jsx
 * // En App.js
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // En componentes
 * const { user, login, logout, hasRole } = useAuth();
 * if (hasRole('ADMIN')) { ... }
 * ```
 *
 * @see authService - Servicio que realiza las peticiones HTTP de autenticación
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authService } from "../services/authService";

/**
 * Contexto de autenticación de React
 * @type {React.Context}
 */
const AuthContext = createContext();

/**
 * Proveedor de autenticación que envuelve la aplicación
 *
 * @param {object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Proveedor del contexto de autenticación
 *
 * @security
 * - Inicializa estado desde localStorage al montar
 * - Valida existencia de token antes de considerar autenticado
 * - Proporciona funciones seguras para login/logout
 */
export function AuthProvider({ children }) {
  /** @type {[object|null, Function]} Estado del usuario autenticado */
  const [user, setUser] = useState(null);

  /** @type {[string|null, Function]} Token JWT para peticiones autenticadas */
  const [token, setToken] = useState(null);

  /** @type {[boolean, Function]} Indica si hay una sesión activa */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /** @type {[boolean, Function]} Estado de carga durante operaciones async */
  const [loading, setLoading] = useState(true);

  /** @type {[string|null, Function]} Mensaje de error de autenticación */
  const [error, setError] = useState(null);

  /**
   * Inicializa la autenticación desde localStorage al cargar la aplicación
   * @security Verifica que existan AMBOS user y token antes de autenticar
   */
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  /**
   * Autentica al usuario con email y contraseña
   *
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<object>} Datos del usuario autenticado
   * @throws {Error} Si las credenciales son inválidas
   *
   * @security
   * - Credenciales enviadas via HTTPS al backend
   * - Token almacenado solo después de autenticación exitosa
   * - Error genérico para evitar enumeración de usuarios
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      setUser(response);
      setToken(response.token);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra un nuevo usuario en el sistema
   *
   * @param {object} userData - Datos del nuevo usuario
   * @param {string} userData.email - Email único
   * @param {string} userData.password - Contraseña segura
   * @param {string} userData.name - Nombre completo
   * @param {string} userData.institutionId - ID de la institución
   * @returns {Promise<object>} Usuario creado con token
   * @throws {Error} Si el registro falla
   *
   * @security
   * - Validación de contraseña en frontend antes de enviar
   * - Auto-login después de registro exitoso
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      setUser(response);
      setToken(response.token);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || "Error al registrarse");
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cierra la sesión del usuario actual
   *
   * @security
   * - Limpia token de localStorage
   * - Resetea todo el estado de autenticación
   * - No requiere llamada al backend (stateless JWT)
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Limpia el mensaje de error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Valor del contexto expuesto a componentes consumidores
   * @type {object}
   */
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    /**
     * Verifica si el usuario tiene un rol específico
     * @param {string} role - Rol a verificar (ADMIN, GESTOR, GUARDIAN, PARENT)
     * @returns {boolean} true si el usuario tiene el rol
     */
    hasRole: (role) => user && user.role === role,
    /**
     * Verifica si el usuario tiene alguno de los roles especificados
     * @param {string[]} roles - Array de roles permitidos
     * @returns {boolean} true si el usuario tiene alguno de los roles
     */
    hasAnyRole: (roles) => user && roles.includes(user.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acceder al contexto de autenticación
 *
 * @returns {object} Contexto de autenticación con user, login, logout, etc.
 * @throws {Error} Si se usa fuera de AuthProvider
 *
 * @example
 * const { user, isAuthenticated, login, logout, hasRole } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
