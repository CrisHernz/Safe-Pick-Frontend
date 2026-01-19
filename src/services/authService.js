/**
 * @fileoverview Servicio de Autenticación del Frontend
 * @module services/authService
 * @security AUTHENTICATION - Gestión de sesiones y tokens en el cliente
 *
 * @description
 * Servicio que maneja toda la lógica de autenticación del lado del cliente:
 * - Registro de nuevos usuarios
 * - Login con email y contraseña
 * - Gestión del token JWT en localStorage
 * - Verificación del estado de autenticación
 * - Verificación de roles de usuario
 *
 * ## Seguridad Implementada:
 * - Token JWT almacenado en localStorage
 * - Limpieza completa de datos al hacer logout
 * - Verificación de roles para control de acceso en UI
 * - No se almacenan contraseñas en el cliente
 *
 * ## Almacenamiento Local:
 * - `token`: JWT para autenticación de peticiones
 * - `user`: Objeto JSON con datos del usuario (sin password)
 *
 * ## Consideraciones de Seguridad:
 * - localStorage es vulnerable a XSS, pero protegido por CSP
 * - En producción considerar httpOnly cookies para mayor seguridad
 * - Token tiene expiración configurada en el backend
 *
 * @see AuthContext - Contexto React que usa este servicio
 * @see apiClient - Cliente HTTP para las peticiones
 */
import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../config/api";

/**
 * Objeto de servicio de autenticación
 * @namespace
 */
export const authService = {
  /**
   * Registra un nuevo usuario en el sistema
   *
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.email - Email único del usuario
   * @param {string} userData.password - Contraseña (mínimo 12 caracteres con requisitos)
   * @param {string} userData.name - Nombre completo
   * @param {string} [userData.role="PARENT"] - Rol del usuario
   * @param {string} [userData.cedula] - Cédula ecuatoriana (10 dígitos)
   * @param {string} [userData.phone] - Teléfono en formato ecuatoriano
   * @param {string} [userData.institutionId] - ID de la institución
   * @returns {Promise<Object>} Usuario creado con token JWT
   * @throws {Error} Si el registro falla
   *
   * @security
   * - Contraseña enviada via HTTPS, nunca almacenada localmente
   * - Token guardado inmediatamente tras registro exitoso
   * - Datos del usuario (sin password) guardados en localStorage
   */
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role || "PARENT",
        cedula: userData.cedula,
        phone: userData.phone,
        institutionId: userData.institutionId,
      });

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Autentica un usuario con email y contraseña
   *
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object>} Datos del usuario autenticado con token
   * @throws {Error} Si las credenciales son inválidas
   *
   * @security
   * - Credenciales enviadas via HTTPS
   * - Token JWT guardado en localStorage tras login exitoso
   * - Password nunca almacenado localmente
   * - Mensaje de error genérico para evitar enumeración
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario actual
   *
   * @security
   * - Elimina token de localStorage
   * - Elimina datos de usuario de localStorage
   * - No requiere llamada al backend (JWT es stateless)
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Obtiene el token JWT almacenado
   *
   * @returns {string|null} Token JWT o null si no existe
   *
   * @security Token usado para autorización en peticiones HTTP
   */
  getToken() {
    return localStorage.getItem("token");
  },

  /**
   * Obtiene los datos del usuario actual desde localStorage
   *
   * @returns {Object|null} Objeto con datos del usuario o null
   *
   * @security No incluye password, solo datos públicos del usuario
   */
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verifica si hay un usuario autenticado
   *
   * @returns {boolean} true si existe un token almacenado
   *
   * @security Solo verifica existencia de token, no su validez
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Verifica si el usuario actual tiene un rol específico
   *
   * @param {string} role - Rol a verificar (ADMIN, GESTOR, GUARDIAN, PARENT)
   * @returns {boolean} true si el usuario tiene el rol especificado
   *
   * @security Usado para renderizado condicional en UI
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {string[]} roles - Array de roles
   * @returns {boolean} True si el usuario tiene alguno de los roles
   */
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  },
};
