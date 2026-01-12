import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import Card from "../common/Card";
import StatCard from "../common/StatCard";
import Modal from "../common/Modal";
import Loading from "../common/Loading";
import apiService from "../../services/api.service";
import {
  translateRole,
  formatDate,
  translateStatus,
} from "../../utils/helpers";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'institution', 'user'
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, institutionsData, usersData, withdrawalsData] =
        await Promise.all([
          apiService.getSystemStats(),
          apiService.getInstitutions(),
          apiService.getUsers(),
          apiService.getWithdrawalHistory(),
        ]);

      setStats(statsData);
      setInstitutions(institutionsData);
      setUsers(usersData);
      setWithdrawals(withdrawalsData);
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

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    try {
      await apiService.createInstitution(formData);
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiService.toggleUserStatus(userId, !currentStatus);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <Loading text="Cargando datos del sistema..." />
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
            <h1 className="dashboard-title">Panel de Administración</h1>
            <p className="dashboard-subtitle">
              Gestión completa del sistema Safe Pick
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" onClick={() => setError("")}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Vista General
          </button>
          <button
            className={`tab ${
              activeTab === "institutions" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("institutions")}
          >
            🏫 Instituciones
          </button>
          <button
            className={`tab ${activeTab === "users" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Usuarios
          </button>
          <button
            className={`tab ${activeTab === "withdrawals" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("withdrawals")}
          >
            📋 Retiros
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <StatCard
                title="Instituciones"
                value={stats?.totalInstitutions || 0}
                icon="🏫"
                color="primary"
              />
              <StatCard
                title="Usuarios Totales"
                value={stats?.totalUsers || 0}
                icon="👥"
                color="success"
              />
              <StatCard
                title="Estudiantes"
                value={stats?.totalStudents || 0}
                icon="🎓"
                color="warning"
              />
              <StatCard
                title="Retiros Hoy"
                value={stats?.totalWithdrawalsToday || 0}
                icon="📤"
                color="danger"
              />
            </div>

            <div className="grid-2">
              <Card title="Usuarios por Rol">
                <div className="role-stats">
                  {stats?.usersByRole?.map((role) => (
                    <div key={role.role} className="role-stat-item">
                      <span className="role-stat-label">
                        {translateRole(role.role)}
                      </span>
                      <span className="role-stat-value">{role._count}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Últimos Retiros">
                <div className="recent-items">
                  {withdrawals?.slice(0, 5).map((withdrawal) => (
                    <div key={withdrawal.id} className="recent-item">
                      <div>
                        <div className="recent-item-title">
                          {withdrawal.student?.firstName}{" "}
                          {withdrawal.student?.lastName}
                        </div>
                        <div className="recent-item-subtitle">
                          Retirado por: {withdrawal.authorizedPerson?.firstName}{" "}
                          {withdrawal.authorizedPerson?.lastName}
                        </div>
                      </div>
                      <span
                        className={`badge ${translateStatus(
                          withdrawal.status
                        ).toLowerCase()}`}
                      >
                        {translateStatus(withdrawal.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Institutions Tab */}
        {activeTab === "institutions" && (
          <Card
            title="Instituciones Educativas"
            subtitle={`${institutions.length} instituciones registradas`}
            actions={
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal("institution")}
              >
                ➕ Nueva Institución
              </button>
            }
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((inst) => (
                    <tr key={inst.id}>
                      <td className="font-semibold">{inst.name}</td>
                      <td>{inst.address}</td>
                      <td>{inst.phone}</td>
                      <td>{inst.email}</td>
                      <td>{formatDate(inst.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card
            title="Gestión de Usuarios"
            subtitle={`${users.length} usuarios en el sistema`}
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Institución</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="font-semibold">
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge">
                          {translateRole(user.role)}
                        </span>
                      </td>
                      <td>{user.institution?.name || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.isActive
                              ? "status-confirmed"
                              : "status-rejected"
                          }`}
                        >
                          {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            user.isActive ? "btn-danger" : "btn-primary"
                          }`}
                          onClick={() =>
                            handleToggleUserStatus(user.id, user.isActive)
                          }
                        >
                          {user.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <Card
            title="Historial de Retiros"
            subtitle={`${withdrawals.length} retiros registrados`}
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Retirado por</th>
                    <th>Institución</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="font-mono text-sm">{withdrawal.code}</td>
                      <td>
                        {withdrawal.student?.firstName}{" "}
                        {withdrawal.student?.lastName}
                      </td>
                      <td>
                        {withdrawal.authorizedPerson?.firstName}{" "}
                        {withdrawal.authorizedPerson?.lastName}
                      </td>
                      <td>{withdrawal.student?.institution?.name}</td>
                      <td>
                        <span
                          className={`badge ${translateStatus(
                            withdrawal.status
                          ).toLowerCase()}`}
                        >
                          {translateStatus(withdrawal.status)}
                        </span>
                      </td>
                      <td>{formatDate(withdrawal.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para crear institución */}
      <Modal
        isOpen={showModal && modalType === "institution"}
        onClose={handleCloseModal}
        title="Nueva Institución"
      >
        <form onSubmit={handleCreateInstitution}>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
            <label className="form-label">Teléfono *</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
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
              Crear Institución
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
