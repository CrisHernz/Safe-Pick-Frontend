// Cliente HTTP reutilizable
import { API_CONFIG } from "../config/api";

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Error en la solicitud");
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error instanceof TypeError) {
      // Error de conexión
      const networkError = new Error("Error de conexión con el servidor");
      networkError.type = "NETWORK_ERROR";
      return networkError;
    }

    if (error.status === 401) {
      // Token expirado o no autorizado
      localStorage.removeItem("token");
      const authError = new Error(
        "Sesión expirada. Por favor, inicia sesión nuevamente"
      );
      authError.type = "AUTH_ERROR";
      return authError;
    }

    if (error.status === 429) {
      const rateLimitError = new Error(
        "Demasiadas solicitudes. Intenta más tarde"
      );
      rateLimitError.type = "RATE_LIMIT_ERROR";
      return rateLimitError;
    }

    return error;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}

const apiClient = new ApiClient(API_CONFIG.BASE_URL);
export default apiClient;
