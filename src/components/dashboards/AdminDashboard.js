import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api.service";
import {
  validateCedulaEcuatoriana,
  validateTelefonoEcuatoriano,
  formatTelefonoEcuatoriano,
} from "../../utils/ecuadorValidation";
import "./Dashboard.css";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("gestores");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
        "La contraseña debe tener mínimo 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos"
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
        "El teléfono debe tener formato ecuatoriano: +593XXXXXXXXX o 09XXXXXXXX"
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
      setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🛡️ SafePick Admin</h1>
          <span className="user-badge admin">Administrador</span>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <button onClick={logout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "gestores" ? "active" : ""}`}
          onClick={() => setActiveTab("gestores")}
        >
          👥 Gestores
        </button>
        <button
          className={`tab-btn ${activeTab === "institutions" ? "active" : ""}`}
          onClick={() => setActiveTab("institutions")}
        >
          🏫 Instituciones
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Tab: Gestores */}
          {activeTab === "gestores" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Gestión de Gestores</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateGestorModal(true)}
                >
                  + Nuevo Gestor
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Cédula</th>
                      <th>Teléfono</th>
                      <th>Institución</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gestores.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data">
                          No hay gestores registrados
                        </td>
                      </tr>
                    ) : (
                      gestores.map((gestor) => (
                        <tr key={gestor.id}>
                          <td>{gestor.name}</td>
                          <td>{gestor.email}</td>
                          <td>{gestor.cedula || "-"}</td>
                          <td>{gestor.phone || "-"}</td>
                          <td>
                            {gestor.institution?.name || (
                              <span className="text-muted">Sin asignar</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${gestor.isActive ? "active" : "inactive"}`}
                            >
                              {gestor.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="btn-small btn-secondary"
                              onClick={() => {
                                setSelectedUser(gestor);
                                setShowAssignInstitutionModal(true);
                              }}
                            >
                              Asignar Institución
                            </button>
                            <button
                              className={`btn-small ${gestor.isActive ? "btn-danger" : "btn-success"}`}
                              onClick={() =>
                                handleToggleUserStatus(
                                  gestor.id,
                                  gestor.isActive
                                )
                              }
                            >
                              {gestor.isActive ? "Desactivar" : "Activar"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Instituciones */}
          {activeTab === "institutions" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Gestión de Instituciones</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateInstitutionModal(true)}
                >
                  + Nueva Institución
                </button>
              </div>

              <div className="cards-grid">
                {institutions.length === 0 ? (
                  <p className="no-data">No hay instituciones registradas</p>
                ) : (
                  institutions.map((inst) => (
                    <div
                      key={inst.id}
                      className={`institution-card ${!inst.isActive ? "inactive" : ""}`}
                    >
                      <div className="card-header">
                        <h3>{inst.name}</h3>
                        <span
                          className={`status-badge ${inst.isActive ? "active" : "inactive"}`}
                        >
                          {inst.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      <div className="card-body">
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
                        <div className="card-stats">
                          <span>👥 {inst.totalUsers || 0} usuarios</span>
                          <span>👶 {inst.totalChildren || 0} niños</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className={`btn-small ${inst.isActive ? "btn-danger" : "btn-success"}`}
                          onClick={() =>
                            handleToggleInstitutionStatus(
                              inst.id,
                              inst.isActive
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
          className="modal-overlay"
          onClick={() => setShowCreateGestorModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Gestor</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateGestorModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateGestor} className="modal-form">
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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
              <div className="form-group">
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateGestorModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
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
          className="modal-overlay"
          onClick={() => setShowCreateInstitutionModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nueva Institución</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateInstitutionModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateInstitution} className="modal-form">
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateInstitutionModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
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
          className="modal-overlay"
          onClick={() => setShowAssignInstitutionModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Asignar Institución</h2>
              <button
                className="modal-close"
                onClick={() => setShowAssignInstitutionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Asignar institución a: <strong>{selectedUser.name}</strong>
              </p>
              <div className="institution-list">
                {institutions
                  .filter((i) => i.isActive)
                  .map((inst) => (
                    <button
                      key={inst.id}
                      className={`institution-option ${selectedUser.institutionId === inst.id ? "selected" : ""}`}
                      onClick={() => handleAssignInstitution(inst.id)}
                    >
                      <span className="inst-name">{inst.name}</span>
                      <span className="inst-stats">
                        {inst.totalUsers || 0} usuarios
                      </span>
                    </button>
                  ))}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
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
