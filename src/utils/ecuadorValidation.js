/**
 * Utilidades de validación para Ecuador
 * Validación de cédula y teléfono ecuatoriano
 */

/**
 * Valida una cédula ecuatoriana
 * @param {string} cedula - La cédula a validar
 * @returns {boolean} - true si es válida, false si no
 */
export const validateCedulaEcuatoriana = (cedula) => {
  if (!cedula) return false;

  // Debe tener exactamente 10 dígitos
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  // Los primeros 2 dígitos corresponden a la provincia (01-24)
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) {
    return false;
  }

  // El tercer dígito debe ser menor a 6 (personas naturales)
  const tercerDigito = parseInt(cedula.charAt(2), 10);
  if (tercerDigito >= 6) {
    return false;
  }

  // Algoritmo de validación del dígito verificador
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula.charAt(9), 10);
  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  return resultado === digitoVerificador;
};

/**
 * Valida un teléfono ecuatoriano
 * Formatos aceptados:
 * - +593XXXXXXXXX (código país + 9 dígitos)
 * - 09XXXXXXXX (celular nacional)
 * - 0XXXXXXXXX (fijo nacional)
 * @param {string} telefono - El teléfono a validar
 * @returns {boolean} - true si es válido, false si no
 */
export const validateTelefonoEcuatoriano = (telefono) => {
  if (!telefono) return false;

  // Formato internacional: +593 seguido de 9 dígitos
  const formatoInternacional = /^\+593[2-79]\d{8}$/;

  // Formato nacional celular: 09 seguido de 8 dígitos
  const formatoNacionalCelular = /^09\d{8}$/;

  // Formato nacional fijo: 0 seguido de código de provincia (2-7) y 7 dígitos
  const formatoNacionalFijo = /^0[2-7]\d{7}$/;

  return (
    formatoInternacional.test(telefono) ||
    formatoNacionalCelular.test(telefono) ||
    formatoNacionalFijo.test(telefono)
  );
};

/**
 * Formatea un teléfono al formato internacional ecuatoriano
 * @param {string} telefono - El teléfono a formatear
 * @returns {string} - El teléfono en formato +593XXXXXXXXX
 */
export const formatTelefonoEcuatoriano = (telefono) => {
  if (!telefono) return "";

  // Remover espacios y guiones
  let cleaned = telefono.replace(/[\s-]/g, "");

  // Si ya tiene formato internacional, retornar
  if (cleaned.startsWith("+593")) {
    return cleaned;
  }

  // Si empieza con 593 (sin +), agregar +
  if (cleaned.startsWith("593")) {
    return "+" + cleaned;
  }

  // Si es formato nacional (empieza con 0), convertir a internacional
  if (cleaned.startsWith("0")) {
    return "+593" + cleaned.substring(1);
  }

  // Si solo tiene los 9 dígitos, agregar +593
  if (/^[2-79]\d{8}$/.test(cleaned)) {
    return "+593" + cleaned;
  }

  return telefono;
};

/**
 * Obtiene información de la provincia por el código de cédula
 * @param {string} cedula - La cédula
 * @returns {string} - Nombre de la provincia o "Desconocida"
 */
export const getProvinciaFromCedula = (cedula) => {
  if (!cedula || cedula.length < 2) return "Desconocida";

  const provincias = {
    "01": "Azuay",
    "02": "Bolívar",
    "03": "Cañar",
    "04": "Carchi",
    "05": "Cotopaxi",
    "06": "Chimborazo",
    "07": "El Oro",
    "08": "Esmeraldas",
    "09": "Guayas",
    10: "Imbabura",
    11: "Loja",
    12: "Los Ríos",
    13: "Manabí",
    14: "Morona Santiago",
    15: "Napo",
    16: "Pastaza",
    17: "Pichincha",
    18: "Tungurahua",
    19: "Zamora Chinchipe",
    20: "Galápagos",
    21: "Sucumbíos",
    22: "Orellana",
    23: "Santo Domingo",
    24: "Santa Elena",
  };

  const codigo = cedula.substring(0, 2);
  return provincias[codigo] || "Desconocida";
};
