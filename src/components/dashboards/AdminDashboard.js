import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api.service";
import {
  validateCedulaEcuatoriana,
  validateTelefonoEcuatoriano,
  formatTelefonoEcuatoriano,
} from "../../utils/ecuadorValidation";
import "./AdminDashboard.css";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("gestores");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  // Estados para gestores
  const [gestores, setGestores] = useState([]);

  // Estados para instituciones
  const [institutions, setInstitutions] = useState([]);

  // Modal states
  const [showCreateGestorModal, setShowCreateGestorModal] = useState(false);
  const [showCreateInstitutionModal, setShowCreateInstitutionModal] =
    useState(false);
  const [showAssignInstitutionModal, setShowAssignInstitutionModal] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [gestorForm, setGestorForm] = useState({
    name: "",
    email: "",
    password: "",
    cedula: "",
    phone: "",
    institutionId: "",
  });

  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [gestoresData, institutionsData] = await Promise.all([
        apiService.getGestores(),
        apiService.getAllInstitutions(),
      ]);
      setGestores(gestoresData || []);
      setInstitutions(institutionsData || []);
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

  const handleCreateGestor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!gestorForm.name || gestorForm.name.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (!PASSWORD_RULE.test(gestorForm.password)) {
      setError(
        "La contraseña debe tener mínimo 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos",
      );
      return;
    }
    // Validación de cédula ecuatoriana
    if (gestorForm.cedula && !validateCedulaEcuatoriana(gestorForm.cedula)) {
      setError("La cédula ecuatoriana no es válida. Debe tener 10 dígitos.");
      return;
    }
    // Validación de teléfono ecuatoriano
    if (gestorForm.phone && !validateTelefonoEcuatoriano(gestorForm.phone)) {
      setError(
        "El teléfono debe tener formato ecuatoriano: +593XXXXXXXXX o 09XXXXXXXX",
      );
      return;
    }

    try {
      await apiService.createUser({
        ...gestorForm,
        phone: gestorForm.phone
          ? formatTelefonoEcuatoriano(gestorForm.phone)
          : undefined,
        role: "GESTOR",
      });
      setSuccess("Gestor creado exitosamente");
      setShowCreateGestorModal(false);
      setGestorForm({
        name: "",
        email: "",
        password: "",
        cedula: "",
        phone: "",
        institutionId: "",
      });
      loadData();
    } catch (err) {
      setError("No se pudo crear el gestor. Verifica los datos.");
    }
  };

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!institutionForm.name || institutionForm.name.length < 3) {
      setError("El nombre de la institución debe tener al menos 3 caracteres");
      return;
    }

    try {
      await apiService.createInstitution(institutionForm);
      setSuccess("Institución creada exitosamente");
      setShowCreateInstitutionModal(false);
      setInstitutionForm({ name: "", address: "", phone: "", email: "" });
      loadData();
    } catch (err) {
      setError("No se pudo crear la institución. Verifica los datos.");
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      setError("");
      if (isActive) {
        await apiService.deactivateUser(userId);
        setSuccess("Usuario desactivado");
      } else {
        await apiService.activateUser(userId);
        setSuccess("Usuario activado");
      }
      loadData();
    } catch (err) {
      setError("No se pudo cambiar el estado del usuario.");
    }
  };

  const handleAssignInstitution = async (institutionId) => {
    if (!selectedUser) return;

    try {
      setError("");
      await apiService.assignInstitutionToUser(selectedUser.id, institutionId);
      setSuccess("Institución asignada exitosamente");
      setShowAssignInstitutionModal(false);
      setSelectedUser(null);
      loadData();
    } catch (err) {
      setError("No se pudo asignar la institución.");
    }
  };

  const handleToggleInstitutionStatus = async (id, isActive) => {
    try {
      setError("");
      if (isActive) {
        await apiService.deleteInstitution(id);
        setSuccess("Institución desactivada");
      } else {
        await apiService.activateInstitution(id);
        setSuccess("Institución activada");
      }
      loadData();
    } catch (err) {
      setError("No se pudo cambiar el estado de la institución.");
    }
  };

  // Si no está autorizado, redirigir al login
  if (unauthorized) {
    return (
      <div className="admin-dashboard">
        <div className="admin-unauthorized">
          <h2>⚠️ Sesión Expirada</h2>
          <p>Tu sesión ha expirado o no tienes permisos para acceder.</p>
          <button
            onClick={() => navigate("/login")}
            className="admin-btn-primary"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1>🛡️ SafePick Admin</h1>
            <span className="admin-role-badge">Administrador</span>
            <span className="admin-user-name">{user?.name}</span>
          </div>
          <div className="admin-header-right">
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="admin-btn-logout"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && (
        <div className="admin-alert admin-alert-success">{success}</div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "gestores" ? "active" : ""}`}
          onClick={() => setActiveTab("gestores")}
        >
          👥 Gestores
        </button>
        <button
          className={`admin-tab ${activeTab === "institutions" ? "active" : ""}`}
          onClick={() => setActiveTab("institutions")}
        >
          🏫 Instituciones
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="admin-content">
          {/* Tab: Gestores */}
          {activeTab === "gestores" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Gestión de Gestores</h2>
                <button
                  className="admin-btn-primary"
                  onClick={() => setShowCreateGestorModal(true)}
                >
                  + Nuevo Gestor
                </button>
              </div>

              <div className="admin-cards-grid">
                {gestores.length === 0 ? (
                  <p className="admin-no-data">No hay gestores registrados</p>
                ) : (
                  gestores.map((gestor) => (
                    <div
                      key={gestor.id}
                      className={`admin-institution-card ${!gestor.isActive ? "inactive" : ""}`}
                    >
                      <div className="admin-card-header">
                        <h3>{gestor.name}</h3>
                        <span
                          className={`admin-status-badge ${gestor.isActive ? "active" : "inactive"}`}
                        >
                          {gestor.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="admin-card-body">
                        <p>
                          <strong>📧 Email:</strong> {gestor.email}
                        </p>
                        <p>
                          <strong>🪪 Cédula:</strong>{" "}
                          {gestor.cedula || "No registrada"}
                        </p>
                        <p>
                          <strong>📞 Teléfono:</strong>{" "}
                          {gestor.phone || "No registrado"}
                        </p>
                        <p>
                          <strong>🏫 Institución:</strong>{" "}
                          {gestor.institution?.name || (
                            <span className="admin-text-muted">
                              Sin asignar
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="admin-card-actions">
                        <button
                          className="admin-btn-small admin-btn-secondary"
                          onClick={() => {
                            setSelectedUser(gestor);
                            setShowAssignInstitutionModal(true);
                          }}
                        >
                          Asignar Institución
                        </button>
                        <button
                          className={`admin-btn-small ${gestor.isActive ? "admin-btn-danger" : "admin-btn-success"}`}
                          onClick={() =>
                            handleToggleUserStatus(gestor.id, gestor.isActive)
                          }
                        >
                          {gestor.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Instituciones */}
          {activeTab === "institutions" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Gestión de Instituciones</h2>
                <button
                  className="admin-btn-primary"
                  onClick={() => setShowCreateInstitutionModal(true)}
                >
                  + Nueva Institución
                </button>
              </div>

              <div className="admin-cards-grid">
                {institutions.length === 0 ? (
                  <p className="admin-no-data">
                    No hay instituciones registradas
                  </p>
                ) : (
                  institutions.map((inst) => (
                    <div
                      key={inst.id}
                      className={`admin-institution-card ${!inst.isActive ? "inactive" : ""}`}
                    >
                      <div className="admin-card-header">
                        <h3>{inst.name}</h3>
                        <span
                          className={`admin-status-badge ${inst.isActive ? "active" : "inactive"}`}
                        >
                          {inst.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      <div className="admin-card-body">
                        <p>
                          <strong>📍 Dirección:</strong>{" "}
                          {inst.address || "No especificada"}
                        </p>
                        <p>
                          <strong>📞 Teléfono:</strong>{" "}
                          {inst.phone || "No especificado"}
                        </p>
                        <p>
                          <strong>📧 Email:</strong>{" "}
                          {inst.email || "No especificado"}
                        </p>
                        <div className="admin-card-stats">
                          <span>👥 {inst.totalUsers || 0} usuarios</span>
                          <span>👶 {inst.totalChildren || 0} niños</span>
                        </div>
                      </div>
                      <div className="admin-card-actions">
                        <button
                          className={`admin-btn-small ${inst.isActive ? "admin-btn-danger" : "admin-btn-success"}`}
                          onClick={() =>
                            handleToggleInstitutionStatus(
                              inst.id,
                              inst.isActive,
                            )
                          }
                        >
                          {inst.isActive ? "Desactivar" : "Activar"}
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

      {/* Modal: Crear Gestor */}
      {showCreateGestorModal && (
        <div
          className="admin-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={() => setShowCreateGestorModal(false)}
          onKeyDown={(e) =>
            e.key === "Escape" && setShowCreateGestorModal(false)
          }
          aria-label="Cerrar modal"
        >
          <div
            className="admin-modal-content"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Crear Nuevo Gestor</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowCreateGestorModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateGestor} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={gestorForm.name}
                  onChange={(e) =>
                    setGestorForm({ ...gestorForm, name: e.target.value })
                  }
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={gestorForm.email}
                  onChange={(e) =>
                    setGestorForm({ ...gestorForm, email: e.target.value })
                  }
                  placeholder="gestor@email.com"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={gestorForm.password}
                  onChange={(e) =>
                    setGestorForm({ ...gestorForm, password: e.target.value })
                  }
                  placeholder="Mínimo 12 caracteres"
                  required
                />
                <small>
                  Incluir mayúsculas, minúsculas, números y símbolos
                </small>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    value={gestorForm.cedula}
                    onChange={(e) =>
                      setGestorForm({
                        ...gestorForm,
                        cedula: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="12345678"
                    maxLength={13}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={gestorForm.phone}
                    onChange={(e) =>
                      setGestorForm({ ...gestorForm, phone: e.target.value })
                    }
                    placeholder="+34612345678"
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Institución</label>
                <select
                  value={gestorForm.institutionId}
                  onChange={(e) =>
                    setGestorForm({
                      ...gestorForm,
                      institutionId: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar institución (opcional)</option>
                  {institutions
                    .filter((i) => i.isActive)
                    .map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowCreateGestorModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Crear Gestor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Institución */}
      {showCreateInstitutionModal && (
        <div
          className="admin-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={() => setShowCreateInstitutionModal(false)}
          onKeyDown={(e) =>
            e.key === "Escape" && setShowCreateInstitutionModal(false)
          }
          aria-label="Cerrar modal"
        >
          <div
            className="admin-modal-content"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Crear Nueva Institución</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowCreateInstitutionModal(false)}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleCreateInstitution}
              className="admin-modal-form"
            >
              <div className="admin-form-group">
                <label>Nombre de la institución *</label>
                <input
                  type="text"
                  value={institutionForm.name}
                  onChange={(e) =>
                    setInstitutionForm({
                      ...institutionForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Colegio San José"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={institutionForm.address}
                  onChange={(e) =>
                    setInstitutionForm({
                      ...institutionForm,
                      address: e.target.value,
                    })
                  }
                  placeholder="Av. Principal 123"
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={institutionForm.phone}
                    onChange={(e) =>
                      setInstitutionForm({
                        ...institutionForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+34911234567"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={institutionForm.email}
                    onChange={(e) =>
                      setInstitutionForm({
                        ...institutionForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="contacto@colegio.edu"
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowCreateInstitutionModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Crear Institución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar Institución */}
      {showAssignInstitutionModal && selectedUser && (
        <div
          className="admin-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={() => setShowAssignInstitutionModal(false)}
          onKeyDown={(e) =>
            e.key === "Escape" && setShowAssignInstitutionModal(false)
          }
          aria-label="Cerrar modal"
        >
          <div
            className="admin-modal-content"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Asignar Institución</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowAssignInstitutionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p>
                Asignar institución a: <strong>{selectedUser.name}</strong>
              </p>
              <div className="admin-institution-list">
                {institutions
                  .filter((i) => i.isActive)
                  .map((inst) => (
                    <button
                      key={inst.id}
                      className={`admin-institution-option ${selectedUser.institutionId === inst.id ? "selected" : ""}`}
                      onClick={() => handleAssignInstitution(inst.id)}
                    >
                      <span className="admin-inst-name">{inst.name}</span>
                      <span className="admin-inst-stats">
                        {inst.totalUsers || 0} usuarios
                      </span>
                    </button>
                  ))}
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-btn-secondary"
                onClick={() => setShowAssignInstitutionModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
