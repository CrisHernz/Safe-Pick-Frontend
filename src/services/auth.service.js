/**
 * Servicio para manejo de autenticación y JWT
 */

class AuthService {
  /**
   * Guarda los datos de autenticación en localStorage
   * @param {object} authData - Datos del login (token, user)
   */
  saveAuth(authData) {
    if (authData.access_token) {
      localStorage.setItem("token", authData.access_token);
    }
    if (authData.user) {
      localStorage.setItem("user", JSON.stringify(authData.user));
    }
  }

  /**
   * Obtiene el token almacenado
   * @returns {string|null} Token JWT
   */
  getToken() {
    return localStorage.getItem("token");
  }

  /**
   * Obtiene los datos del usuario autenticado
   * @returns {object|null} Datos del usuario
   */
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  /**
   * Verifica si hay una sesión activa
   * @returns {boolean} true si está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean} true si el usuario tiene ese rol
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  /**
   * Obtiene el nombre completo del usuario
   * @returns {string} Nombre completo
   */
  getFullName() {
    const user = this.getUser();
    if (!user) return "";
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Obtiene el rol traducido al español
   * @returns {string} Rol en español
   */
  getRoleName() {
    const user = this.getUser();
    if (!user) return "";

    const roleNames = {
      ADMIN: "Administrador",
      ADMIN_ESCOLAR: "Administrador Escolar",
      PADRE: "Padre/Madre",
      GUARDIA: "Guardia",
      ENCARGADO: "Persona Autorizada",
    };

    return roleNames[user.role] || user.role;
  }
}

const authService = new AuthService();
export default authService;
