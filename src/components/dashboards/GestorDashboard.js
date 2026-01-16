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

export default function GestorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("guardians");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
        "La contraseña debe tener mínimo 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos"
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
        "El teléfono debe tener formato ecuatoriano: +593XXXXXXXXX o 09XXXXXXXX"
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
      setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📋 SafePick Gestor</h1>
          <span className="user-badge gestor">Gestor</span>
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
          className={`tab-btn ${activeTab === "guardians" ? "active" : ""}`}
          onClick={() => setActiveTab("guardians")}
        >
          🛡️ Guardias
        </button>
        <button
          className={`tab-btn ${activeTab === "parents" ? "active" : ""}`}
          onClick={() => setActiveTab("parents")}
        >
          👨‍👩‍👧‍👦 Padres y Niños
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Tab: Guardias */}
          {activeTab === "guardians" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Gestión de Guardias de mi Institución</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateGuardianModal(true)}
                >
                  + Nuevo Guardia
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
                      <th>Estado</th>
                      <th>Registrado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardians.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data">
                          No hay guardias registrados en tu institución
                        </td>
                      </tr>
                    ) : (
                      guardians.map((guardian) => (
                        <tr key={guardian.id}>
                          <td>{guardian.name}</td>
                          <td>{guardian.email}</td>
                          <td>{guardian.cedula || "-"}</td>
                          <td>{guardian.phone || "-"}</td>
                          <td>
                            <span
                              className={`status-badge ${guardian.isActive ? "active" : "inactive"}`}
                            >
                              {guardian.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            {new Date(guardian.createdAt).toLocaleDateString()}
                          </td>
                          <td className="actions-cell">
                            <button
                              className={`btn-small ${guardian.isActive ? "btn-danger" : "btn-success"}`}
                              onClick={() =>
                                handleToggleGuardianStatus(
                                  guardian.id,
                                  guardian.isActive
                                )
                              }
                            >
                              {guardian.isActive ? "Desactivar" : "Activar"}
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

          {/* Tab: Padres y Niños */}
          {activeTab === "parents" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>Padres de Familia y sus Hijos</h2>
              </div>

              <div className="cards-grid parents-grid">
                {parents.length === 0 ? (
                  <p className="no-data">
                    No hay padres registrados en tu institución
                  </p>
                ) : (
                  parents.map((parent) => (
                    <div key={parent.id} className="parent-card">
                      <div className="card-header">
                        <h3>👤 {parent.name}</h3>
                      </div>
                      <div className="card-body">
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

                        <div className="children-section">
                          <h4>👶 Hijos registrados:</h4>
                          {parent.children && parent.children.length > 0 ? (
                            <ul className="children-list">
                              {parent.children.map((child) => (
                                <li key={child.id}>
                                  <span className="child-name">
                                    {child.name}
                                  </span>
                                  <span className="child-grade">
                                    {child.grade}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="no-children">Sin hijos asignados</p>
                          )}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn-primary btn-small"
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
          className="modal-overlay"
          onClick={() => setShowCreateGuardianModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Guardia</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateGuardianModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateGuardian} className="modal-form">
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateGuardianModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
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
          className="modal-overlay"
          onClick={() => setShowAssignChildModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Hijo</h2>
              <button
                className="modal-close"
                onClick={() => setShowAssignChildModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-subtitle">
              Padre: <strong>{selectedParent.name}</strong>
            </div>
            <form onSubmit={handleAssignChild} className="modal-form">
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAssignChildModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
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
