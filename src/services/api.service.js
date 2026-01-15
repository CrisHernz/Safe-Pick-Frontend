/**
 * Servicio centralizado para comunicación con el API
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

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
      console.error(`API Error [${method} ${endpoint}]:`, error);
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

  // Admin endpoints
  getInstitutions() {
    return this.request("/admin/institutions");
  }

  createInstitution(data) {
    return this.request("/admin/institutions", "POST", data);
  }

  updateInstitution(id, data) {
    return this.request(`/admin/institutions/${id}`, "PUT", data);
  }

  deleteInstitution(id) {
    return this.request(`/admin/institutions/${id}`, "DELETE");
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

  updateAuthorizedPerson(id, data) {
    return Promise.reject(new Error("Not implemented"));
  }

  deleteAuthorizedPerson(id) {
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
}

const apiService = new ApiService();
export default apiService;
