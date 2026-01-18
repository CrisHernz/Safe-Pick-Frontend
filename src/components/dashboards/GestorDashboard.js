import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api.service";
import {
  validateCedulaEcuatoriana,
  validateTelefonoEcuatoriano,
  formatTelefonoEcuatoriano,
} from "../../utils/ecuadorValidation";
import "./GestorDashboard.css";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

export default function GestorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("guardians");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  // Estados para guardias
  const [guardians, setGuardians] = useState([]);

  // Estados para padres y sus hijos
  const [parents, setParents] = useState([]);

  // Modal states
  const [showCreateGuardianModal, setShowCreateGuardianModal] = useState(false);
  const [showAssignChildModal, setShowAssignChildModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  // Form states
  const [guardianForm, setGuardianForm] = useState({
    name: "",
    email: "",
    password: "",
    cedula: "",
    phone: "",
  });

  const [childForm, setChildForm] = useState({
    name: "",
    grade: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [guardiansData, parentsData] = await Promise.all([
        apiService.getMyInstitutionGuardians(),
        apiService.getMyInstitutionParents(),
      ]);
      setGuardians(guardiansData || []);
      setParents(parentsData || []);
    } catch (err) {
      // Si es error de autorización, mostrar pantalla de no autorizado
      if (
        err.message === "Unauthorized" ||
        err.message?.includes("401") ||
        err.message?.includes("No autorizado")
      ) {
        setUnauthorized(true);
        logout(); // Limpiar sesión
      } else {
        setError("No se pudieron cargar los datos. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateGuardian = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!guardianForm.name || guardianForm.name.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (!PASSWORD_RULE.test(guardianForm.password)) {
      setError(
        "La contraseña debe tener mínimo 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos",
      );
      return;
    }
    // Validación de cédula ecuatoriana
    if (
      guardianForm.cedula &&
      !validateCedulaEcuatoriana(guardianForm.cedula)
    ) {
      setError("La cédula ecuatoriana no es válida. Debe tener 10 dígitos.");
      return;
    }
    // Validación de teléfono ecuatoriano
    if (
      guardianForm.phone &&
      !validateTelefonoEcuatoriano(guardianForm.phone)
    ) {
      setError(
        "El teléfono debe tener formato ecuatoriano: +593XXXXXXXXX o 09XXXXXXXX",
      );
      return;
    }

    try {
      await apiService.createUser({
        ...guardianForm,
        phone: guardianForm.phone
          ? formatTelefonoEcuatoriano(guardianForm.phone)
          : undefined,
        role: "GUARDIAN",
      });
      setSuccess("Guardia creado exitosamente");
      setShowCreateGuardianModal(false);
      setGuardianForm({
        name: "",
        email: "",
        password: "",
        cedula: "",
        phone: "",
      });
      loadData();
    } catch (err) {
      setError("No se pudo crear el guardia. Verifica los datos.");
    }
  };

  const handleAssignChild = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!childForm.name || childForm.name.length < 3) {
      setError("El nombre del niño debe tener al menos 3 caracteres");
      return;
    }
    if (!childForm.grade) {
      setError("El grado es requerido");
      return;
    }
    if (!selectedParent) {
      setError("Debe seleccionar un padre");
      return;
    }

    try {
      await apiService.assignChildToParent(selectedParent.id, childForm);
      setSuccess("Niño asignado exitosamente");
      setShowAssignChildModal(false);
      setChildForm({ name: "", grade: "" });
      setSelectedParent(null);
      loadData();
    } catch (err) {
      setError("No se pudo asignar el niño. Verifica los datos.");
    }
  };

  const handleToggleGuardianStatus = async (userId, isActive) => {
    try {
      setError("");
      if (isActive) {
        await apiService.deactivateUser(userId);
        setSuccess("Guardia desactivado");
      } else {
        await apiService.activateUser(userId);
        setSuccess("Guardia activado");
      }
      loadData();
    } catch (err) {
      setError("No se pudo cambiar el estado del guardia.");
    }
  };

  const openAssignChildModal = (parent) => {
    setSelectedParent(parent);
    setShowAssignChildModal(true);
  };

  // Grades options
  const gradeOptions = [
    "Preescolar",
    "1° Primaria",
    "2° Primaria",
    "3° Primaria",
    "4° Primaria",
    "5° Primaria",
    "6° Primaria",
    "1° Secundaria",
    "2° Secundaria",
    "3° Secundaria",
  ];

  // Si no está autorizado, redirigir al login
  if (unauthorized) {
    return (
      <div className="gestor-dashboard">
        <div className="gestor-unauthorized">
          <h2>⚠️ Sesión Expirada</h2>
          <p>Tu sesión ha expirado o no tienes permisos para acceder.</p>
          <button
            onClick={() => navigate("/login")}
            className="gestor-btn-primary"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gestor-dashboard">
      {/* Header */}
      <header className="gestor-header">
        <div className="gestor-header-content">
          <div className="gestor-header-left">
            <h1>📋 SafePick Gestor</h1>
            <span className="gestor-role-badge">Gestor</span>
            <span className="gestor-user-name">{user?.name}</span>
          </div>
          <div className="gestor-header-right">
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="gestor-btn-logout"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && <div className="gestor-alert gestor-alert-error">{error}</div>}
      {success && (
        <div className="gestor-alert gestor-alert-success">{success}</div>
      )}

      {/* Tabs */}
      <div className="gestor-tabs">
        <button
          className={`gestor-tab ${activeTab === "guardians" ? "active" : ""}`}
          onClick={() => setActiveTab("guardians")}
        >
          🛡️ Guardias
        </button>
        <button
          className={`gestor-tab ${activeTab === "parents" ? "active" : ""}`}
          onClick={() => setActiveTab("parents")}
        >
          👨‍👩‍👧‍👦 Padres y Niños
        </button>
      </div>

      {loading ? (
        <div className="gestor-loading">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="gestor-content">
          {/* Tab: Guardias */}
          {activeTab === "guardians" && (
            <div className="gestor-section">
              <div className="gestor-section-header">
                <h2>Gestión de Guardias de mi Institución</h2>
                <button
                  className="gestor-btn-primary"
                  onClick={() => setShowCreateGuardianModal(true)}
                >
                  + Nuevo Guardia
                </button>
              </div>

              <div className="gestor-cards-grid">
                {guardians.length === 0 ? (
                  <p className="gestor-no-data">
                    No hay guardias registrados en tu institución
                  </p>
                ) : (
                  guardians.map((guardian) => (
                    <div
                      key={guardian.id}
                      className={`gestor-parent-card ${!guardian.isActive ? "inactive" : ""}`}
                    >
                      <div className="gestor-card-header">
                        <h3>🛡️ {guardian.name}</h3>
                        <span
                          className={`gestor-status-badge ${guardian.isActive ? "active" : "inactive"}`}
                        >
                          {guardian.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="gestor-card-body">
                        <p>
                          <strong>📧 Email:</strong> {guardian.email}
                        </p>
                        <p>
                          <strong>🪪 Cédula:</strong>{" "}
                          {guardian.cedula || "No registrada"}
                        </p>
                        <p>
                          <strong>📞 Teléfono:</strong>{" "}
                          {guardian.phone || "No registrado"}
                        </p>
                        <p>
                          <strong>📅 Registrado:</strong>{" "}
                          {new Date(guardian.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="gestor-card-actions">
                        <button
                          className={`gestor-btn-small ${guardian.isActive ? "gestor-btn-danger" : "gestor-btn-success"}`}
                          onClick={() =>
                            handleToggleGuardianStatus(
                              guardian.id,
                              guardian.isActive,
                            )
                          }
                        >
                          {guardian.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Padres y Niños */}
          {activeTab === "parents" && (
            <div className="gestor-section">
              <div className="gestor-section-header">
                <h2>Padres de Familia y sus Hijos</h2>
              </div>

              <div className="gestor-cards-grid gestor-parents-grid">
                {parents.length === 0 ? (
                  <p className="gestor-no-data">
                    No hay padres registrados en tu institución
                  </p>
                ) : (
                  parents.map((parent) => (
                    <div key={parent.id} className="gestor-parent-card">
                      <div className="gestor-card-header">
                        <h3>👤 {parent.name}</h3>
                      </div>
                      <div className="gestor-card-body">
                        <p>
                          <strong>📧 Email:</strong> {parent.email}
                        </p>
                        <p>
                          <strong>🪪 Cédula:</strong>{" "}
                          {parent.cedula || "No registrada"}
                        </p>
                        <p>
                          <strong>📞 Teléfono:</strong>{" "}
                          {parent.phone || "No registrado"}
                        </p>

                        <div className="gestor-children-section">
                          <h4>👶 Hijos registrados:</h4>
                          {parent.children && parent.children.length > 0 ? (
                            <ul className="gestor-children-list">
                              {parent.children.map((child) => (
                                <li key={child.id}>
                                  <span className="gestor-child-name">
                                    {child.name}
                                  </span>
                                  <span className="gestor-child-grade">
                                    {child.grade}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="gestor-no-children">
                              Sin hijos asignados
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="gestor-card-actions">
                        <button
                          className="gestor-btn-primary gestor-btn-small"
                          onClick={() => openAssignChildModal(parent)}
                        >
                          + Agregar Hijo
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Crear Guardia */}
      {showCreateGuardianModal && (
        <div
          className="gestor-modal-overlay"
          onClick={() => setShowCreateGuardianModal(false)}
        >
          <div
            className="gestor-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gestor-modal-header">
              <h2>Crear Nuevo Guardia</h2>
              <button
                className="gestor-modal-close"
                onClick={() => setShowCreateGuardianModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateGuardian} className="gestor-modal-form">
              <div className="gestor-form-group">
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={guardianForm.name}
                  onChange={(e) =>
                    setGuardianForm({ ...guardianForm, name: e.target.value })
                  }
                  placeholder="Roberto Hernández"
                  required
                />
              </div>
              <div className="gestor-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={guardianForm.email}
                  onChange={(e) =>
                    setGuardianForm({ ...guardianForm, email: e.target.value })
                  }
                  placeholder="guardia@colegio.com"
                  required
                />
              </div>
              <div className="gestor-form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={guardianForm.password}
                  onChange={(e) =>
                    setGuardianForm({
                      ...guardianForm,
                      password: e.target.value,
                    })
                  }
                  placeholder="Mínimo 12 caracteres"
                  required
                />
                <small>
                  Incluir mayúsculas, minúsculas, números y símbolos (@$!%*?&)
                </small>
              </div>
              <div className="gestor-form-row">
                <div className="gestor-form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    value={guardianForm.cedula}
                    onChange={(e) =>
                      setGuardianForm({
                        ...guardianForm,
                        cedula: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="12345678"
                    maxLength={13}
                  />
                </div>
                <div className="gestor-form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={guardianForm.phone}
                    onChange={(e) =>
                      setGuardianForm({
                        ...guardianForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+34612345678"
                  />
                </div>
              </div>
              <div className="gestor-modal-actions">
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setShowCreateGuardianModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="gestor-btn-primary">
                  Crear Guardia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar Hijo */}
      {showAssignChildModal && selectedParent && (
        <div
          className="gestor-modal-overlay"
          onClick={() => setShowAssignChildModal(false)}
        >
          <div
            className="gestor-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gestor-modal-header">
              <h2>Agregar Hijo</h2>
              <button
                className="gestor-modal-close"
                onClick={() => setShowAssignChildModal(false)}
              >
                ×
              </button>
            </div>
            <div className="gestor-modal-subtitle">
              Padre: <strong>{selectedParent.name}</strong>
            </div>
            <form onSubmit={handleAssignChild} className="gestor-modal-form">
              <div className="gestor-form-group">
                <label>Nombre del niño *</label>
                <input
                  type="text"
                  value={childForm.name}
                  onChange={(e) =>
                    setChildForm({ ...childForm, name: e.target.value })
                  }
                  placeholder="Sofía García"
                  required
                />
              </div>
              <div className="gestor-form-group">
                <label>Grado *</label>
                <select
                  value={childForm.grade}
                  onChange={(e) =>
                    setChildForm({ ...childForm, grade: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar grado</option>
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div className="gestor-modal-actions">
                <button
                  type="button"
                  className="gestor-btn-secondary"
                  onClick={() => setShowAssignChildModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="gestor-btn-primary">
                  Agregar Hijo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
