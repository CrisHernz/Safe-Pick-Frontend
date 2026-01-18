/**
 * Servicio centralizado para comunicación con el API
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

class ApiService {
  /**
   * Realiza una petición HTTP al backend
   * @param {string} endpoint - Endpoint del API
   * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
   * @param {object} body - Cuerpo de la petición (opcional)
   * @param {boolean} requiresAuth - Si requiere token de autorización
   * @returns {Promise<any>} - Respuesta del servidor
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

  // Auth endpoints
  login(email, password) {
    return this.request("/auth/login", "POST", { email, password }, false);
  }

  register(userData) {
    return this.request("/auth/register", "POST", userData, false);
  }

  // ============ PARENT ENDPOINTS ============
  getMyChildren() {
    return this.request("/children");
  }

  createWithdrawalOrder(data) {
    return this.request("/withdrawals", "POST", data);
  }

  getWithdrawalOrders(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/withdrawals${params ? "?" + params : ""}`);
  }

  getPickerCredentials(orderId) {
    return this.request(`/withdrawals/${orderId}/credentials`, "POST");
  }

  cancelWithdrawalOrder(orderId) {
    return this.request(`/withdrawals/${orderId}/cancel`, "POST");
  }

  // ============ GUARDIAN ENDPOINTS ============
  validateQR(qrToken) {
    return this.request("/withdrawals/validate-qr", "POST", { qrToken });
  }

  scanAndCompleteWithdrawal(qrToken) {
    return this.request("/withdrawals/guardian/scan-and-complete", "POST", {
      qrToken,
    });
  }

  // ============ PICKER ENDPOINTS ============
  loginPicker(cedula, temporaryCode) {
    return this.request(
      "/auth/login-picker",
      "POST",
      { cedula, temporaryCode },
      false,
    );
  }

  getPickerOrder() {
    return this.request("/withdrawals/picker/my-order");
  }

  // ============ USER PROFILE ENDPOINTS ============
  getUserProfile() {
    return this.request("/auth/me");
  }

  linkTelegramAccount(chatId) {
    return this.request("/auth/telegram/link", "POST", { chatId });
  }

  // ============ INSTITUTIONS ENDPOINTS (ADMIN) ============

  // Búsqueda pública para autocompletado (sin auth)
  searchInstitutions(query) {
    return this.request(
      `/institutions/search?q=${encodeURIComponent(query)}`,
      "GET",
      null,
      false,
    );
  }

  // Lista pública de instituciones (sin auth)
  getPublicInstitutions() {
    return this.request("/institutions/public", "GET", null, false);
  }

  // Obtener todas las instituciones con estadísticas (admin/gestor)
  getAllInstitutions() {
    return this.request("/institutions");
  }

  // Obtener una institución por ID
  getInstitutionById(id) {
    return this.request(`/institutions/${id}`);
  }

  // Crear nueva institución (admin)
  createInstitution(data) {
    return this.request("/institutions", "POST", data);
  }

  // Actualizar institución
  updateInstitution(id, data) {
    return this.request(`/institutions/${id}`, "PUT", data);
  }

  // Desactivar institución (admin)
  deleteInstitution(id) {
    return this.request(`/institutions/${id}`, "DELETE");
  }

  // Activar institución (admin)
  activateInstitution(id) {
    return this.request(`/institutions/${id}/activate`, "PUT");
  }

  // Obtener usuarios de una institución
  getInstitutionUsers(id, role = null) {
    const params = role ? `?role=${role}` : "";
    return this.request(`/institutions/${id}/users${params}`);
  }

  // Obtener niños de una institución
  getInstitutionChildren(id) {
    return this.request(`/institutions/${id}/children`);
  }

  // ============ USERS MANAGEMENT ENDPOINTS (ADMIN/GESTOR) ============

  // Obtener todos los usuarios (admin)
  getAllUsers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/users${params ? "?" + params : ""}`);
  }

  // Obtener todos los gestores (admin)
  getGestores() {
    return this.request("/users/gestores");
  }

  // Obtener guardias de mi institución (gestor)
  getMyInstitutionGuardians() {
    return this.request("/users/my-institution/guardians");
  }

  // Obtener padres de mi institución (gestor)
  getMyInstitutionParents() {
    return this.request("/users/my-institution/parents");
  }

  // Obtener usuario por ID (admin/gestor)
  getUserById(id) {
    return this.request(`/users/${id}`);
  }

  // Crear usuario (admin crea gestores, gestor crea guardias)
  createUser(data) {
    return this.request("/users", "POST", data);
  }

  // Actualizar usuario (admin/gestor)
  updateUser(id, data) {
    return this.request(`/users/${id}`, "PUT", data);
  }

  // Activar usuario (admin/gestor)
  activateUser(id) {
    return this.request(`/users/${id}/activate`, "PATCH");
  }

  // Desactivar usuario (admin/gestor)
  deactivateUser(id) {
    return this.request(`/users/${id}/deactivate`, "PATCH");
  }

  // Asignar institución a usuario (admin)
  assignInstitutionToUser(userId, institutionId) {
    return this.request(`/users/${userId}/assign-institution`, "PATCH", {
      institutionId,
    });
  }

  // Asignar hijo a padre (gestor)
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
