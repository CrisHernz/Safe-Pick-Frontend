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

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

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
      errors.email = "Correo electronico invalido";
    }

    if (!PASSWORD_RULE.test(formData.password)) {
      errors.password =
        "La contrasena debe tener minimo 12 caracteres e incluir mayusculas, minusculas, numeros y simbolos";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contrasenas no coinciden";
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
            <label htmlFor="email">Correo electronico</label>
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
            <label htmlFor="cedula">Cedula</label>
            <input
              id="cedula"
              name="cedula"
              type="text"
              value={formData.cedula}
              onChange={(event) => {
                const onlyDigits = event.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "cedula", value: onlyDigits } });
              }}
              placeholder="12345678"
              disabled={loading}
              required
              maxLength={13}
            />
            {validationErrors.cedula && (
              <span className="error-message">{validationErrors.cedula}</span>
            )}
          </div>

          <PhoneInput
            label="Telefono del padre"
            id="parent-phone"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={loading}
            required
            helperText="Selecciona el pais y luego escribe solo los numeros"
            error={validationErrors.phone}
          />

          <div className="form-group institution-autocomplete">
            <label htmlFor="institution">
              Institucion educativa (opcional)
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
              Puedes dejarlo vacio y seleccionarlo despues
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contrasena</label>
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
              Minimo 12 caracteres, incluye mayuscula, minuscula, numero y
              simbolo
            </small>
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contrasena"
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
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
