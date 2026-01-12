import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import Card from "../common/Card";
import StatCard from "../common/StatCard";
import Modal from "../common/Modal";
import Loading from "../common/Loading";
import apiService from "../../services/api.service";
import { formatDate } from "../../utils/helpers";
import "./Dashboard.css";

export default function AdminEscolarDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [guards, setGuards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, studentsData, parentsData, guardsData] =
        await Promise.all([
          apiService.getSchoolStats(),
          apiService.getStudents(),
          apiService.getParents(),
          apiService.getGuards(),
        ]);

      setStats(statsData);
      setStudents(studentsData);
      setParents(parentsData);
      setGuards(guardsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({});
    setError("");
  };

  const handleRegisterParent = async (e) => {
    e.preventDefault();
    try {
      await apiService.registerParent(formData);
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    try {
      await apiService.registerStudent(formData);
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterGuard = async (e) => {
    e.preventDefault();
    try {
      await apiService.registerGuard(formData);
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <Loading text="Cargando datos de la institución..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Panel Administración Escolar</h1>
            <p className="dashboard-subtitle">
              Gestión de estudiantes, padres y guardias
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" onClick={() => setError("")}>
            {error}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Vista General
          </button>
          <button
            className={`tab ${activeTab === "students" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            🎓 Estudiantes
          </button>
          <button
            className={`tab ${activeTab === "parents" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("parents")}
          >
            👨‍👩‍👧‍👦 Padres
          </button>
          <button
            className={`tab ${activeTab === "guards" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("guards")}
          >
            🛡️ Guardias
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <StatCard
                title="Estudiantes"
                value={students.length}
                icon="🎓"
                color="primary"
              />
              <StatCard
                title="Padres"
                value={parents.length}
                icon="👨‍👩‍👧‍👦"
                color="success"
              />
              <StatCard
                title="Guardias"
                value={guards.length}
                icon="🛡️"
                color="warning"
              />
              <StatCard
                title="Retiros Hoy"
                value={stats?.todayWithdrawals || 0}
                icon="📤"
                color="danger"
              />
            </div>

            <Card title="Estudiantes por Grado">
              <div className="role-stats">
                {stats?.studentsByGrade &&
                  Object.entries(stats.studentsByGrade).map(
                    ([grade, count]) => (
                      <div key={grade} className="role-stat-item">
                        <span className="role-stat-label">{grade}° Grado</span>
                        <span className="role-stat-value">{count}</span>
                      </div>
                    )
                  )}
              </div>
            </Card>
          </>
        )}

        {activeTab === "students" && (
          <Card
            title="Estudiantes"
            subtitle={`${students.length} estudiantes registrados`}
            actions={
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal("student")}
              >
                ➕ Nuevo Estudiante
              </button>
            }
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Grado</th>
                    <th>Padre/Madre</th>
                    <th>Teléfono</th>
                    <th>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="font-semibold">
                        {student.firstName} {student.lastName}
                      </td>
                      <td>{student.grade}°</td>
                      <td>
                        {student.parent?.user?.firstName}{" "}
                        {student.parent?.user?.lastName}
                      </td>
                      <td>{student.parent?.phoneNumber}</td>
                      <td>{formatDate(student.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "parents" && (
          <Card
            title="Padres de Familia"
            subtitle={`${parents.length} padres registrados`}
            actions={
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal("parent")}
              >
                ➕ Nuevo Padre
              </button>
            }
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((parent) => (
                    <tr key={parent.id}>
                      <td className="font-semibold">
                        {parent.user?.firstName} {parent.user?.lastName}
                      </td>
                      <td>{parent.dni}</td>
                      <td>{parent.user?.email}</td>
                      <td>{parent.phoneNumber}</td>
                      <td>{parent.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "guards" && (
          <Card
            title="Guardias de Seguridad"
            subtitle={`${guards.length} guardias registrados`}
            actions={
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal("guard")}
              >
                ➕ Nuevo Guardia
              </button>
            }
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>N° Placa</th>
                    <th>Turno</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {guards.map((guard) => (
                    <tr key={guard.id}>
                      <td className="font-semibold">
                        {guard.user?.firstName} {guard.user?.lastName}
                      </td>
                      <td>{guard.user?.email}</td>
                      <td>{guard.badgeNumber}</td>
                      <td>
                        <span className="badge">{guard.shift}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            guard.user?.isActive
                              ? "status-confirmed"
                              : "status-rejected"
                          }`}
                        >
                          {guard.user?.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showModal && modalType === "parent"}
        onClose={handleCloseModal}
        title="Registrar Padre/Madre"
      >
        <form onSubmit={handleRegisterParent}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">DNI *</label>
            <input
              type="text"
              className="form-input"
              maxLength="8"
              value={formData.dni || ""}
              onChange={(e) =>
                setFormData({ ...formData, dni: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono *</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phoneNumber || ""}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección *</label>
            <input
              type="text"
              className="form-input"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              type="password"
              className="form-input"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength="6"
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Padre
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showModal && modalType === "student"}
        onClose={handleCloseModal}
        title="Registrar Estudiante"
      >
        <form onSubmit={handleRegisterStudent}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Grado *</label>
              <select
                className="form-select"
                value={formData.grade || ""}
                onChange={(e) =>
                  setFormData({ ...formData, grade: Number(e.target.value) })
                }
                required
              >
                <option value="">Seleccionar...</option>
                {[1, 2, 3, 4, 5, 6].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}° Grado
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sección</label>
              <input
                type="text"
                className="form-input"
                maxLength="1"
                value={formData.section || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    section: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Padre/Madre *</label>
            <select
              className="form-select"
              value={formData.parentId || ""}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              required
            >
              <option value="">Seleccionar...</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.user?.firstName} {parent.user?.lastName} -{" "}
                  {parent.dni}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Estudiante
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showModal && modalType === "guard"}
        onClose={handleCloseModal}
        title="Registrar Guardia"
      >
        <form onSubmit={handleRegisterGuard}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">N° de Placa *</label>
              <input
                type="text"
                className="form-input"
                value={formData.badgeNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, badgeNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Turno *</label>
              <select
                className="form-select"
                value={formData.shift || ""}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value })
                }
                required
              >
                <option value="">Seleccionar...</option>
                <option value="MAÑANA">Mañana</option>
                <option value="TARDE">Tarde</option>
                <option value="NOCHE">Noche</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              type="password"
              className="form-input"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength="6"
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Guardia
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
