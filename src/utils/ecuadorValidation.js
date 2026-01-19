/**
 * @fileoverview Utilidades de Validación para Ecuador
 * @module utils/ecuadorValidation
 * @security INPUT_VALIDATION - Validación de datos de entrada específicos de Ecuador
 *
 * @description
 * Módulo que proporciona funciones de validación para datos específicos de Ecuador:
 * - Validación de cédula de identidad ecuatoriana (algoritmo módulo 10)
 * - Validación de números de teléfono ecuatorianos (fijo y celular)
 * - Formateo de teléfonos al estándar internacional E.164
 * - Identificación de provincia por código de cédula
 *
 * ## Seguridad Implementada:
 * - Previene inyección de datos inválidos al backend
 * - Valida formato antes de enviar al servidor
 * - Algoritmo oficial del Registro Civil de Ecuador para cédulas
 * - Regex estrictos para formatos de teléfono
 *
 * ## Uso:
 * ```javascript
 * import { validateCedulaEcuatoriana, validateTelefonoEcuatoriano } from './ecuadorValidation';
 *
 * if (!validateCedulaEcuatoriana(cedula)) {
 *   setError('Cédula inválida');
 * }
 * ```
 *
 * @see https://www.registrocivil.gob.ec/ - Registro Civil de Ecuador
 */

/**
 * Valida una cédula de identidad ecuatoriana
 *
 * Implementa el algoritmo oficial del Registro Civil de Ecuador (módulo 10)
 * para verificar la validez matemática de una cédula.
 *
 * @param {string} cedula - Número de cédula a validar (10 dígitos)
 * @returns {boolean} true si la cédula es válida, false si no
 *
 * @security
 * - Valida longitud exacta de 10 dígitos
 * - Verifica código de provincia válido (01-24)
 * - Verifica tercer dígito para personas naturales (<6)
 * - Aplica algoritmo de dígito verificador
 *
 * @example
 * validateCedulaEcuatoriana('1710034065'); // true
 * validateCedulaEcuatoriana('0000000000'); // false
 * validateCedulaEcuatoriana('123'); // false (longitud inválida)
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

  // Algoritmo de validación del dígito verificador (módulo 10)
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
 * Valida un número de teléfono ecuatoriano
 *
 * Soporta múltiples formatos de teléfono de Ecuador:
 * - Internacional: +593XXXXXXXXX
 * - Celular nacional: 09XXXXXXXX
 * - Fijo nacional: 0XXXXXXXXX
 *
 * @param {string} telefono - Número de teléfono a validar
 * @returns {boolean} true si el formato es válido, false si no
 *
 * @security
 * - Regex estrictos que solo aceptan formatos válidos de Ecuador
 * - Previene inyección de caracteres especiales
 * - Valida estructura según estándares de telecomunicaciones
 *
 * @example
 * validateTelefonoEcuatoriano('+593991234567'); // true (internacional)
 * validateTelefonoEcuatoriano('0991234567'); // true (celular)
 * validateTelefonoEcuatoriano('022123456'); // true (fijo Quito)
 * validateTelefonoEcuatoriano('123'); // false
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
 * Formatea un teléfono al formato internacional ecuatoriano (E.164)
 *
 * Convierte cualquier formato de teléfono ecuatoriano válido
 * al formato internacional estándar +593XXXXXXXXX.
 *
 * @param {string} telefono - Teléfono en cualquier formato
 * @returns {string} Teléfono en formato +593XXXXXXXXX
 *
 * @security
 * - Sanitiza el input removiendo espacios y guiones
 * - Normaliza al formato estándar para almacenamiento consistente
 *
 * @example
 * formatTelefonoEcuatoriano('0991234567'); // '+593991234567'
 * formatTelefonoEcuatoriano('593991234567'); // '+593991234567'
 * formatTelefonoEcuatoriano('+593991234567'); // '+593991234567' (sin cambio)
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
 * Obtiene el nombre de la provincia a partir del código de cédula
 *
 * Los primeros 2 dígitos de la cédula ecuatoriana indican
 * la provincia de emisión del documento.
 *
 * @param {string} cedula - Número de cédula (mínimo 2 dígitos)
 * @returns {string} Nombre de la provincia o "Desconocida"
 *
 * @example
 * getProvinciaFromCedula('1710034065'); // 'Pichincha'
 * getProvinciaFromCedula('0912345678'); // 'Guayas'
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
