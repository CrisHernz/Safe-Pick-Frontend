// Configuración de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
  },
  CHILDREN: {
    GET_ALL: "/children",
    GET_BY_ID: (id) => `/children/${id}`,
  },
  WITHDRAWALS: {
    GET_ALL: "/withdrawals",
    GET_BY_ID: (id) => `/withdrawals/${id}`,
    CREATE: "/withdrawals",
    COMPLETE: (id) => `/withdrawals/${id}/complete`,
    CANCEL: (id) => `/withdrawals/${id}/cancel`,
    GET_CREDENTIALS: (id) => `/withdrawals/${id}/credentials`,
    VALIDATE_QR: "/withdrawals/validate-qr",
    PICKER_ORDER: "/withdrawals/picker/my-order",
  },
};

export const WITHDRAWAL_STATUS = {
  PENDING: "PENDING",
  VALIDATED: "VALIDATED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const USER_ROLES = {
  PARENT: "PARENT",
  GUARDIAN: "GUARDIAN",
  ADMIN: "ADMIN",
  PICKER: "PICKER",
};

export const RELATIONSHIPS = [
  "padre",
  "madre",
  "abuelo",
  "abuela",
  "tío",
  "tía",
  "hermano",
  "hermana",
  "otro",
];
