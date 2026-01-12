/**
 * Utilidades generales para el frontend
 */

/**
 * Formatea una fecha a formato legible en español
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formatea solo la hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Hora formateada
 */
export const formatTime = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Traduce el rol al español
 * @param {string} role - Rol en inglés
 * @returns {string} Rol en español
 */
export const translateRole = (role) => {
  const roles = {
    ADMIN: "Administrador",
    ADMIN_ESCOLAR: "Admin Escolar",
    PADRE: "Padre/Madre",
    GUARDIA: "Guardia",
    ENCARGADO: "Encargado",
  };
  return roles[role] || role;
};

/**
 * Traduce el estado a español
 * @param {string} status - Estado en inglés
 * @returns {string} Estado en español
 */
export const translateStatus = (status) => {
  const statuses = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    REJECTED: "Rechazado",
    EXPIRED: "Expirado",
  };
  return statuses[status] || status;
};

/**
 * Obtiene clase CSS según el estado
 * @param {string} status - Estado
 * @returns {string} Clase CSS
 */
export const getStatusClass = (status) => {
  const classes = {
    PENDING: "status-pending",
    CONFIRMED: "status-confirmed",
    REJECTED: "status-rejected",
    EXPIRED: "status-expired",
  };
  return classes[status] || "";
};

/**
 * Trunca un texto largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Valida un DNI peruano (8 dígitos)
 * @param {string} dni - DNI a validar
 * @returns {boolean} true si es válido
 */
export const isValidDNI = (dni) => {
  return /^\d{8}$/.test(dni);
};

/**
 * Formatea un DNI
 * @param {string} dni - DNI a formatear
 * @returns {string} DNI formateado
 */
export const formatDNI = (dni) => {
  if (!dni) return "";
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Genera un color aleatorio para avatares
 * @param {string} text - Texto para generar color
 * @returns {string} Color hexadecimal
 */
export const generateColorFromText = (text) => {
  if (!text) return "#6B7280";
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(
    Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215
  );
  return "#" + color.toString(16).padStart(6, "0");
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Descarga un archivo
 * @param {string} data - Datos del archivo (base64 o blob)
 * @param {string} filename - Nombre del archivo
 * @param {string} type - Tipo MIME
 */
export const downloadFile = (data, filename, type = "image/png") => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} true si se copió exitosamente
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Error al copiar:", err);
    return false;
  }
};
