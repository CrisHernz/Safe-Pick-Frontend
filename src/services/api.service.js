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

  signup(userData) {
    return this.request("/auth/signup", "POST", userData, false);
  }

  // Admin endpoints (legacy - usar los nuevos endpoints de /institutions y /users)
  getInstitutions() {
    return this.request("/institutions");
  }

  getUsers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/admin/users${params ? "?" + params : ""}`);
  }

  toggleUserStatus(id, isActive) {
    return this.request(`/admin/users/${id}/status`, "PUT", { isActive });
  }

  getSystemStats() {
    return this.request("/admin/stats");
  }

  getWithdrawalHistory(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/admin/withdrawals${params ? "?" + params : ""}`);
  }

  // School Admin endpoints
  registerParent(data) {
    return this.request("/school-admin/parents", "POST", data);
  }

  getParents() {
    return this.request("/school-admin/parents");
  }

  registerStudent(data) {
    return this.request("/school-admin/students", "POST", data);
  }

  getStudents() {
    return this.request("/school-admin/students");
  }

  updateStudent(id, data) {
    return this.request(`/school-admin/students/${id}`, "PUT", data);
  }

  deleteStudent(id) {
    return this.request(`/school-admin/students/${id}`, "DELETE");
  }

  registerGuard(data) {
    return this.request("/school-admin/guards", "POST", data);
  }

  getGuards() {
    return this.request("/school-admin/guards");
  }

  getSchoolStats() {
    return this.request("/school-admin/stats");
  }

  getSchoolWithdrawals(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(
      `/school-admin/withdrawals${params ? "?" + params : ""}`
    );
  }

  // Parent endpoints
  getMyChildren() {
    return this.request("/children");
  }

  // Personas autorizadas vienen en las órdenes de retiro
  getAuthorizedPersons() {
    // Los pickers están incluidos en withdrawals, retornar array vacío
    return Promise.resolve([]);
  }

  registerAuthorizedPerson(data) {
    // Esta funcionalidad se hace al crear una orden de retiro
    return this.request("/withdrawals", "POST", data);
  }

  updateAuthorizedPerson(_id, _data) {
    return Promise.reject(new Error("Not implemented"));
  }

  deleteAuthorizedPerson(_id) {
    return Promise.reject(new Error("Not implemented"));
  }

  generateWithdrawalCode(data) {
    return this.request("/withdrawals", "POST", data);
  }

  getWithdrawalCodes(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/withdrawals${params ? "?" + params : ""}`);
  }

  createWithdrawalOrder(data) {
    return this.request("/withdrawals", "POST", data);
  }

  getPickerCredentials(orderId) {
    return this.request(`/withdrawals/${orderId}/credentials`, "POST");
  }

  cancelWithdrawalOrder(orderId) {
    return this.request(`/withdrawals/${orderId}/cancel`, "POST");
  }

  getParentWithdrawalHistory(studentId) {
    return this.request(`/parent/withdrawal-history/${studentId}`);
  }

  // Guard endpoints
  validateCode(code) {
    return this.request("/guard/validate", "POST", { code });
  }

  confirmWithdrawal(id, guardNotes) {
    return this.request("/guard/confirm", "POST", { id, guardNotes });
  }

  rejectWithdrawal(id, rejectionReason) {
    return this.request(`/guard/reject/${id}`, "POST", { rejectionReason });
  }

  getMyValidations(date) {
    const params = date ? `?date=${date}` : "";
    return this.request(`/guard/validations${params}`);
  }

  getGuardStats() {
    return this.request("/guard/stats");
  }

  getPendingCodes() {
    return this.request("/guard/pending");
  }

  // Guard QR validation endpoints
  validateQR(encryptedData) {
    return this.request("/withdrawals/validate-qr", "POST", { encryptedData });
  }

  completeWithdrawal(orderId) {
    return this.request("/withdrawals/guardian/scan-and-complete", "POST", {
      orderId,
    });
  }

  // Picker endpoints
  loginPicker(cedula, temporaryCode) {
    return this.request(
      "/auth/login-picker",
      "POST",
      { cedula, temporaryCode },
      false
    );
  }

  getPickerOrder() {
    return this.request("/withdrawals/picker/my-order");
  }

  // User profile endpoints
  getUserProfile() {
    return this.request("/auth/me");
  }

  linkTelegramAccount(chatId) {
    return this.request("/auth/telegram/link", "POST", { chatId });
  }

  // ============ INSTITUTIONS ENDPOINTS ============

  // Búsqueda pública para autocompletado (sin auth)
  searchInstitutions(query) {
    return this.request(
      `/institutions/search?q=${encodeURIComponent(query)}`,
      "GET",
      null,
      false
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

  // ============ USERS MANAGEMENT ENDPOINTS ============

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

  // Obtener usuario por ID
  getUserById(id) {
    return this.request(`/users/${id}`);
  }

  // Crear usuario (admin crea gestores, gestor crea guardias)
  createUser(data) {
    return this.request("/users", "POST", data);
  }

  // Actualizar usuario
  updateUser(id, data) {
    return this.request(`/users/${id}`, "PUT", data);
  }

  // Activar usuario
  activateUser(id) {
    return this.request(`/users/${id}/activate`, "PATCH");
  }

  // Desactivar usuario
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
      childData
    );
  }
}

const apiService = new ApiService();
export default apiService;
