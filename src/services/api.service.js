/**
 * @fileoverview Servicio centralizado de comunicación con el API
 * @module services/api.service
 * @security HTTP_CLIENT - Cliente HTTP seguro para peticiones al backend
 *
 * @description
 * Clase singleton que centraliza todas las peticiones HTTP al backend de SafePick.
 * Proporciona una capa de abstracción segura para la comunicación cliente-servidor.
 *
 * ## Seguridad Implementada:
 * - Token JWT añadido automáticamente a peticiones autenticadas
 * - Headers Content-Type configurados correctamente
 * - Errores de red manejados sin exponer información sensible
 * - No se logean endpoints ni datos sensibles en consola
 * - Comunicación via HTTPS en producción
 *
 * ## Características:
 * - Método base `request()` reutilizable para todas las peticiones
 * - Métodos específicos para cada endpoint del API
 * - Soporte para peticiones autenticadas y públicas
 * - Parsing automático de respuestas JSON
 *
 * ## Configuración:
 * - API_URL se configura via variable de entorno REACT_APP_API_URL
 * - Por defecto apunta a localhost:3001 para desarrollo
 *
 * @example
 * import apiService from './api.service';
 *
 * // Petición autenticada
 * const children = await apiService.getMyChildren();
 *
 * // Petición pública
 * const institutions = await apiService.getPublicInstitutions();
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

/**
 * Servicio de API para comunicación con el backend
 * @class
 */
class ApiService {
  /**
   * Realiza una petición HTTP al backend
   *
   * Método base que maneja la configuración de headers, autenticación,
   * serialización de datos y manejo de errores.
   *
   * @param {string} endpoint - Ruta del endpoint (ej: "/auth/login")
   * @param {string} [method="GET"] - Método HTTP (GET, POST, PUT, DELETE, PATCH)
   * @param {object|null} [body=null] - Cuerpo de la petición (será serializado a JSON)
   * @param {boolean} [requiresAuth=true] - Si debe incluir token JWT
   * @returns {Promise<any>} Respuesta parseada del servidor
   * @throws {Error} Si la respuesta no es exitosa (status >= 400)
   *
   * @security
   * - Token JWT extraído de localStorage y añadido como Bearer token
   * - Content-Type siempre application/json para prevenir CSRF
   * - Errores no exponen detalles de implementación
   * - No se logean URLs ni datos en consola
   *
   * @example
   * // Petición GET autenticada
   * const data = await this.request('/users/me');
   *
   * // Petición POST pública
   * const result = await this.request('/auth/login', 'POST', { email, password }, false);
   */
  async request(endpoint, method = "GET", body = null, requiresAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (requiresAuth) {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const config = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      // No mostrar detalles de endpoints en consola por seguridad
      throw error;
    }
  }

  // ============ AUTH ENDPOINTS ============
  /**
   * Autentica un usuario con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<object>} Usuario autenticado con token JWT
   * @security Endpoint público - no requiere autenticación previa
   */
  login(email, password) {
    return this.request("/auth/login", "POST", { email, password }, false);
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param {object} userData - Datos del usuario a registrar
   * @returns {Promise<object>} Usuario creado con token JWT
   * @security Endpoint público - validaciones en backend
   */
  register(userData) {
    return this.request("/auth/register", "POST", userData, false);
  }

  // ============ PARENT ENDPOINTS ============
  /**
   * Obtiene los hijos registrados del padre autenticado
   * @returns {Promise<Array>} Lista de hijos con datos completos
   * @security Requiere autenticación - solo retorna hijos del usuario actual
   */
  getMyChildren() {
    return this.request("/children");
  }

  /**
   * Crea una nueva orden de retiro para un hijo
   * @param {object} data - Datos de la orden (childId, pickerId, fecha)
   * @returns {Promise<object>} Orden creada con QR y credenciales
   * @security Requiere rol PARENT - validación de propiedad del hijo
   */
  createWithdrawalOrder(data) {
    return this.request("/withdrawals", "POST", data);
  }

  /**
   * Obtiene historial de órdenes de retiro
   * @param {object} filters - Filtros opcionales (status, fecha)
   * @returns {Promise<Array>} Lista de órdenes filtradas
   * @security Requiere autenticación - filtrado por rol en backend
   */
  getWithdrawalOrders(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/withdrawals${params ? "?" + params : ""}`);
  }

  /**
   * Genera credenciales temporales para un picker
   * @param {string} orderId - ID de la orden de retiro
   * @returns {Promise<object>} Credenciales (código OTP, QR)
   * @security Requiere rol PARENT - solo para órdenes propias
   */
  getPickerCredentials(orderId) {
    return this.request(`/withdrawals/${orderId}/credentials`, "POST");
  }

  /**
   * Cancela una orden de retiro pendiente
   * @param {string} orderId - ID de la orden a cancelar
   * @returns {Promise<object>} Confirmación de cancelación
   * @security Requiere rol PARENT - solo órdenes propias en estado PENDING
   */
  cancelWithdrawalOrder(orderId) {
    return this.request(`/withdrawals/${orderId}/cancel`, "POST");
  }

  // ============ GUARDIAN ENDPOINTS ============
  /**
   * Valida un código QR escaneado por el guardia
   * @param {string} qrToken - Token único del QR escaneado
   * @returns {Promise<object>} Datos de la orden si es válida
   * @security Requiere rol GUARDIAN - validación de institución
   */
  validateQR(qrToken) {
    return this.request("/withdrawals/validate-qr", "POST", { qrToken });
  }

  /**
   * Escanea QR y completa el retiro en una sola operación
   * @param {string} qrToken - Token del QR escaneado
   * @returns {Promise<object>} Orden completada con timestamp
   * @security Requiere rol GUARDIAN - registra log de auditoría
   */
  scanAndCompleteWithdrawal(qrToken) {
    return this.request("/withdrawals/guardian/scan-and-complete", "POST", {
      qrToken,
    });
  }

  // ============ PICKER ENDPOINTS ============
  /**
   * Autentica un picker temporal con cédula y código OTP
   * @param {string} cedula - Cédula de identidad del picker
   * @param {string} temporaryCode - Código OTP de 6 dígitos
   * @returns {Promise<object>} Token JWT temporal y datos de la orden
   * @security Endpoint público - código expira y es de un solo uso
   */
  loginPicker(cedula, temporaryCode) {
    return this.request(
      "/auth/login-picker",
      "POST",
      { cedula, temporaryCode },
      false,
    );
  }

  /**
   * Obtiene la orden asignada al picker autenticado
   * @returns {Promise<object>} Datos de la orden de retiro
   * @security Requiere token temporal de PICKER
   */
  getPickerOrder() {
    return this.request("/withdrawals/picker/my-order");
  }

  // ============ USER PROFILE ENDPOINTS ============
  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<object>} Datos del perfil (sin información sensible)
   * @security Requiere autenticación - no expone contraseña
   */
  getUserProfile() {
    return this.request("/auth/me");
  }

  /**
   * Vincula cuenta de Telegram para notificaciones
   * @param {string} chatId - ID del chat de Telegram
   * @returns {Promise<object>} Confirmación de vinculación
   * @security Requiere autenticación - solo vincula propia cuenta
   */
  linkTelegramAccount(chatId) {
    return this.request("/auth/telegram/link", "POST", { chatId });
  }

  // ============ INSTITUTIONS ENDPOINTS (ADMIN) ============

  /**
   * Busca instituciones por nombre (autocompletado público)
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Instituciones que coinciden
   * @security Endpoint público - solo retorna datos básicos
   */
  searchInstitutions(query) {
    return this.request(
      `/institutions/search?q=${encodeURIComponent(query)}`,
      "GET",
      null,
      false,
    );
  }

  /**
   * Lista instituciones activas para registro público
   * @returns {Promise<Array>} Lista de instituciones básicas
   * @security Endpoint público - sin datos sensibles
   */
  getPublicInstitutions() {
    return this.request("/institutions/public", "GET", null, false);
  }

  /**
   * Obtiene todas las instituciones con estadísticas
   * @returns {Promise<Array>} Instituciones con conteo de usuarios/niños
   * @security Requiere rol ADMIN o GESTOR
   */
  getAllInstitutions() {
    return this.request("/institutions");
  }

  /**
   * Obtiene detalles de una institución específica
   * @param {string} id - ID de la institución
   * @returns {Promise<object>} Datos completos de la institución
   * @security Requiere rol ADMIN o GESTOR de esa institución
   */
  getInstitutionById(id) {
    return this.request(`/institutions/${id}`);
  }

  /**
   * Crea una nueva institución educativa
   * @param {object} data - Datos de la institución (nombre, dirección, etc.)
   * @returns {Promise<object>} Institución creada
   * @security Requiere rol ADMIN exclusivamente
   */
  createInstitution(data) {
    return this.request("/institutions", "POST", data);
  }

  /**
   * Actualiza datos de una institución existente
   * @param {string} id - ID de la institución
   * @param {object} data - Datos a actualizar
   * @returns {Promise<object>} Institución actualizada
   * @security Requiere rol ADMIN
   */
  updateInstitution(id, data) {
    return this.request(`/institutions/${id}`, "PUT", data);
  }

  /**
   * Desactiva una institución (soft delete)
   * @param {string} id - ID de la institución
   * @returns {Promise<object>} Confirmación de desactivación
   * @security Requiere rol ADMIN - no elimina datos
   */
  deleteInstitution(id) {
    return this.request(`/institutions/${id}`, "DELETE");
  }

  /**
   * Reactiva una institución previamente desactivada
   * @param {string} id - ID de la institución
   * @returns {Promise<object>} Institución reactivada
   * @security Requiere rol ADMIN
   */
  activateInstitution(id) {
    return this.request(`/institutions/${id}/activate`, "PUT");
  }

  /**
   * Obtiene usuarios de una institución, filtrados por rol
   * @param {string} id - ID de la institución
   * @param {string|null} role - Rol a filtrar (GUARDIAN, PARENT, GESTOR)
   * @returns {Promise<Array>} Lista de usuarios filtrados
   * @security Requiere rol ADMIN o GESTOR de la institución
   */
  getInstitutionUsers(id, role = null) {
    const params = role ? `?role=${role}` : "";
    return this.request(`/institutions/${id}/users${params}`);
  }

  /**
   * Obtiene niños registrados en una institución
   * @param {string} id - ID de la institución
   * @returns {Promise<Array>} Lista de niños con sus padres
   * @security Requiere rol ADMIN o GESTOR de la institución
   */
  getInstitutionChildren(id) {
    return this.request(`/institutions/${id}/children`);
  }

  // ============ USERS MANAGEMENT ENDPOINTS (ADMIN/GESTOR) ============

  /**
   * Obtiene todos los usuarios del sistema con filtros
   * @param {object} filters - Filtros (role, institutionId, isActive)
   * @returns {Promise<Array>} Lista de usuarios paginada
   * @security Requiere rol ADMIN - acceso global
   */
  getAllUsers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/users${params ? "?" + params : ""}`);
  }

  /**
   * Obtiene lista de gestores del sistema
   * @returns {Promise<Array>} Lista de gestores con sus instituciones
   * @security Requiere rol ADMIN
   */
  getGestores() {
    return this.request("/users/gestores");
  }

  /**
   * Obtiene guardias de la institución del gestor actual
   * @returns {Promise<Array>} Lista de guardias
   * @security Requiere rol GESTOR - filtrado automático por institución
   */
  getMyInstitutionGuardians() {
    return this.request("/users/my-institution/guardians");
  }

  /**
   * Obtiene padres de la institución del gestor actual
   * @returns {Promise<Array>} Lista de padres con sus hijos
   * @security Requiere rol GESTOR - filtrado automático por institución
   */
  getMyInstitutionParents() {
    return this.request("/users/my-institution/parents");
  }

  /**
   * Obtiene un usuario específico por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise<object>} Datos completos del usuario
   * @security Requiere rol ADMIN o GESTOR de la misma institución
   */
  getUserById(id) {
    return this.request(`/users/${id}`);
  }

  /**
   * Crea un nuevo usuario en el sistema
   * @param {object} data - Datos del usuario (email, nombre, rol, institución)
   * @returns {Promise<object>} Usuario creado
   * @security ADMIN crea gestores, GESTOR crea guardias/padres
   */
  createUser(data) {
    return this.request("/users", "POST", data);
  }

  /**
   * Actualiza datos de un usuario existente
   * @param {string} id - ID del usuario
   * @param {object} data - Datos a actualizar
   * @returns {Promise<object>} Usuario actualizado
   * @security Requiere permisos según rol del usuario objetivo
   */
  updateUser(id, data) {
    return this.request(`/users/${id}`, "PUT", data);
  }

  /**
   * Reactiva un usuario previamente desactivado
   * @param {string} id - ID del usuario
   * @returns {Promise<object>} Usuario reactivado
   * @security Requiere rol ADMIN o GESTOR según jerarquía
   */
  activateUser(id) {
    return this.request(`/users/${id}/activate`, "PATCH");
  }

  /**
   * Desactiva un usuario (soft delete)
   * @param {string} id - ID del usuario
   * @returns {Promise<object>} Confirmación de desactivación
   * @security Requiere rol ADMIN o GESTOR - no elimina datos
   */
  deactivateUser(id) {
    return this.request(`/users/${id}/deactivate`, "PATCH");
  }

  /**
   * Asigna una institución a un usuario
   * @param {string} userId - ID del usuario
   * @param {string} institutionId - ID de la institución
   * @returns {Promise<object>} Usuario actualizado
   * @security Requiere rol ADMIN exclusivamente
   */
  assignInstitutionToUser(userId, institutionId) {
    return this.request(`/users/${userId}/assign-institution`, "PATCH", {
      institutionId,
    });
  }

  /**
   * Registra un nuevo hijo a un padre de familia
   * @param {string} parentId - ID del padre
   * @param {object} childData - Datos del niño (nombre, grado, etc.)
   * @returns {Promise<object>} Niño creado y asignado
   * @security Requiere rol GESTOR de la institución del padre
   */
  assignChildToParent(parentId, childData) {
    return this.request(
      `/users/parents/${parentId}/children`,
      "POST",
      childData,
    );
  }
}

const apiService = new ApiService();
export default apiService;
