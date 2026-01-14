// Servicio de Autenticación
import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../config/api";

export const authService = {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado y token
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
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Datos del usuario y token
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
   * Cierra la sesión actual
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Obtiene el token actual
   * @returns {string|null} Token JWT o null
   */
  getToken() {
    return localStorage.getItem("token");
  },

  /**
   * Obtiene el usuario actual del localStorage
   * @returns {Object|null} Datos del usuario o null
   */
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean} True si el usuario tiene ese rol
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
