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
  INSTITUTIONS: {
    SEARCH: "/institutions/search",
    PUBLIC_LIST: "/institutions/public",
    GET_ALL: "/institutions",
    GET_BY_ID: (id) => `/institutions/${id}`,
    CREATE: "/institutions",
    UPDATE: (id) => `/institutions/${id}`,
    DELETE: (id) => `/institutions/${id}`,
    ACTIVATE: (id) => `/institutions/${id}/activate`,
    GET_USERS: (id) => `/institutions/${id}/users`,
    GET_CHILDREN: (id) => `/institutions/${id}/children`,
  },
  USERS: {
    GET_ALL: "/users",
    GET_GESTORES: "/users/gestores",
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    ACTIVATE: (id) => `/users/${id}/activate`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`,
    ASSIGN_INSTITUTION: (id) => `/users/${id}/assign-institution`,
    MY_INSTITUTION_GUARDIANS: "/users/my-institution/guardians",
    MY_INSTITUTION_PARENTS: "/users/my-institution/parents",
    ASSIGN_CHILD: (parentId) => `/users/parents/${parentId}/children`,
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
  GESTOR: "GESTOR",
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
