/**
 * @fileoverview Componente de Registro de Usuarios
 * @module components/Register
 * @security USER_REGISTRATION - Registro seguro de nuevos usuarios
 *
 * @description
 * Componente React para el registro de nuevos usuarios (padres de familia).
 * Implementa validaciones de seguridad en cliente y servidor.
 *
 * ## Seguridad Implementada:
 * - Validación de contraseña OWASP (12+ caracteres, complejidad)
 * - Validación de cédula ecuatoriana (algoritmo módulo 10)
 * - Validación de teléfono ecuatoriano (formatos nacionales)
 * - Confirmación de contraseña antes de envío
 * - Autocompletado seguro de instituciones (debounce)
 * - Mensajes de error no revelan información sensible
 *
 * ## Política de Contraseñas:
 * - Mínimo 12 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial (@$!%*?&)
 *
 * @see AuthContext - Contexto de autenticación
 * @see ecuadorValidation - Funciones de validación
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PhoneInput from "./common/PhoneInput";
import apiService from "../services/api.service";
import {
  validateCedulaEcuatoriana,
  validateTelefonoEcuatoriano,
  formatTelefonoEcuatoriano,
} from "../utils/ecuadorValidation";
import "./Register.css";

/**
 * Expresión regular para validación de contraseña según OWASP
 * @security Requiere: mayúscula, minúscula, número, carácter especial, 12+ chars
 */
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

/**
 * Componente de formulario de registro
 *
 * @returns {JSX.Element} Formulario de registro con validaciones
 *
 * @security
 * - Validaciones en cliente antes de envío
 * - Doble validación en servidor (backend)
 * - Búsqueda de instituciones con debounce (previene DoS)
 */
function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cedula: "",
    phone: "",
    institutionId: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para autocompletado de instituciones
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [searchingInstitutions, setSearchingInstitutions] = useState(false);

  // Debounce para búsqueda de instituciones
  const searchInstitutions = useCallback(async (query) => {
    if (query.length < 2) {
      setInstitutions([]);
      return;
    }

    setSearchingInstitutions(true);
    try {
      const results = await apiService.searchInstitutions(query);
      setInstitutions(results || []);
    } catch (err) {
      // Error silencioso - no exponer detalles en consola
      setInstitutions([]);
    } finally {
      setSearchingInstitutions(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (institutionSearch && !selectedInstitution) {
        searchInstitutions(institutionSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [institutionSearch, selectedInstitution, searchInstitutions]);

  const handleInstitutionSelect = (institution) => {
    setSelectedInstitution(institution);
    setInstitutionSearch(institution.name);
    setFormData((prev) => ({ ...prev, institutionId: institution.id }));
    setShowInstitutionDropdown(false);
    if (validationErrors.institutionId) {
      setValidationErrors((prev) => ({ ...prev, institutionId: "" }));
    }
  };

  const handleInstitutionInputChange = (e) => {
    const value = e.target.value;
    setInstitutionSearch(value);
    setSelectedInstitution(null);
    setFormData((prev) => ({ ...prev, institutionId: "" }));
    setShowInstitutionDropdown(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) {
      clearError();
    }
  };

  const handlePhoneChange = (phoneValue) => {
    setFormData((prev) => ({ ...prev, phone: phoneValue }));
    if (validationErrors.phone) {
      setValidationErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Correo electrónico inválido";
    }

    if (!PASSWORD_RULE.test(formData.password)) {
      errors.password =
        "La contraseña debe tener mínimo 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validación de cédula ecuatoriana
    if (!validateCedulaEcuatoriana(formData.cedula)) {
      errors.cedula =
        "La cédula ecuatoriana no es válida. Debe tener 10 dígitos.";
    }

    // Validación de teléfono ecuatoriano
    if (!validateTelefonoEcuatoriano(formData.phone)) {
      errors.phone =
        "El teléfono debe tener formato ecuatoriano: +593XXXXXXXXX, 09XXXXXXXX";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        cedula: formData.cedula,
        phone: formatTelefonoEcuatoriano(formData.phone),
        role: "PARENT",
        institutionId: formData.institutionId || undefined,
      });

      setSuccessMessage("Registro exitoso. Redirigiendo...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      // Error manejado por AuthContext
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Crear cuenta SafePick</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Perez"
              disabled={loading}
              required
            />
            {validationErrors.name && (
              <span className="error-message">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={loading}
              required
            />
            {validationErrors.email && (
              <span className="error-message">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cedula">Cédula (10 dígitos)</label>
            <input
              id="cedula"
              name="cedula"
              type="text"
              value={formData.cedula}
              onChange={(event) => {
                const onlyDigits = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
                handleChange({ target: { name: "cedula", value: onlyDigits } });
              }}
              placeholder="1712345678"
              disabled={loading}
              required
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]{10}"
            />
            {validationErrors.cedula && (
              <span className="error-message">{validationErrors.cedula}</span>
            )}
          </div>

          <div className="form-group">
            <PhoneInput
              label="Teléfono del padre"
              id="parent-phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              disabled={loading}
              required
              helperText="Selecciona el país y luego escribe solo los números"
              error={validationErrors.phone}
            />
          </div>

          <div className="form-group institution-autocomplete">
            <label htmlFor="institution">
              Institución educativa (opcional)
            </label>
            <div className="autocomplete-container">
              <input
                id="institution"
                type="text"
                value={institutionSearch}
                onChange={handleInstitutionInputChange}
                onFocus={() =>
                  institutionSearch.length >= 2 &&
                  setShowInstitutionDropdown(true)
                }
                onBlur={() =>
                  setTimeout(() => setShowInstitutionDropdown(false), 200)
                }
                placeholder="Escribe para buscar..."
                disabled={loading}
                autoComplete="off"
              />
              {searchingInstitutions && (
                <span className="search-indicator">Buscando...</span>
              )}
              {showInstitutionDropdown && institutions.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {institutions.map((inst) => (
                    <li
                      key={inst.id}
                      onClick={() => handleInstitutionSelect(inst)}
                      className="autocomplete-item"
                    >
                      <span className="inst-name">{inst.name}</span>
                      {inst.address && (
                        <span className="inst-address">{inst.address}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {showInstitutionDropdown &&
                institutionSearch.length >= 2 &&
                institutions.length === 0 &&
                !searchingInstitutions && (
                  <ul className="autocomplete-dropdown">
                    <li className="autocomplete-item no-results">
                      No se encontraron instituciones
                    </li>
                  </ul>
                )}
            </div>
            {selectedInstitution && (
              <span className="selected-institution">
                ✓ {selectedInstitution.name}
              </span>
            )}
            <small className="input-hint">
              Puedes dejarlo vacío y seleccionarlo después
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••"
              disabled={loading}
              required
            />
            <small className="input-hint">
              Mínimo 12 caracteres, incluye mayúscula, minúscula, número y
              símbolo
            </small>
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              disabled={loading}
              required
            />
            {validationErrors.confirmPassword && (
              <span className="error-message">
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="register-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
