import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import Card from "../common/Card";
import StatCard from "../common/StatCard";
import Modal from "../common/Modal";
import Loading from "../common/Loading";
import apiService from "../../services/api.service";
import {
  formatDateTime,
  translateStatus,
  getStatusClass,
  getInitials,
  generateColorFromText,
  copyToClipboard,
} from "../../utils/helpers";
import "./Dashboard.css";

export default function PadreDashboard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [authorizedPersons, setAuthorizedPersons] = useState([]);
  const [withdrawalCodes, setWithdrawalCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("children");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenData, authPersonsData, codesData] = await Promise.all([
        apiService.getMyChildren(),
        apiService.getAuthorizedPersons(),
        apiService.getWithdrawalCodes(),
      ]);

      setChildren(childrenData);
      setAuthorizedPersons(authPersonsData);
      setWithdrawalCodes(codesData);
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

  const handleRegisterAuthorizedPerson = async (e) => {
    e.preventDefault();
    try {
      await apiService.registerAuthorizedPerson(formData);
      await loadData();
      setSuccess("Persona autorizada registrada correctamente");
      handleCloseModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    try {
      const result = await apiService.generateWithdrawalCode(formData);
      await loadData();
      setSuccess(`Código QR generado: ${result.code}`);
      handleCloseModal();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyCode = async (code) => {
    const copied = await copyToClipboard(code);
    if (copied) {
      setSuccess("Código copiado al portapapeles");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <Loading text="Cargando información..." />
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
            <h1 className="dashboard-title">Panel de Padre/Madre</h1>
            <p className="dashboard-subtitle">
              Gestiona retiros y personas autorizadas
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" onClick={() => setError("")}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" onClick={() => setSuccess("")}>
            {success}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === "children" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("children")}
          >
            👶 Mis Hijos
          </button>
          <button
            className={`tab ${activeTab === "authorized" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("authorized")}
          >
            👤 Personas Autorizadas
          </button>
          <button
            className={`tab ${activeTab === "codes" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("codes")}
          >
            🎫 Códigos QR
          </button>
        </div>

        {activeTab === "children" && (
          <>
            <div className="stats-grid">
              <StatCard
                title="Mis Hijos"
                value={children.length}
                icon="👶"
                color="primary"
              />
              <StatCard
                title="Personas Autorizadas"
                value={authorizedPersons.length}
                icon="👤"
                color="success"
              />
              <StatCard
                title="Códigos Activos"
                value={
                  withdrawalCodes.filter((c) => c.status === "PENDING").length
                }
                icon="🎫"
                color="warning"
              />
            </div>

            <div className="students-grid">
              {children.map((child) => (
                <div key={child.id} className="student-card">
                  <div className="student-header">
                    <div
                      className="student-avatar"
                      style={{
                        backgroundColor: generateColorFromText(
                          `${child.firstName} ${child.lastName}`
                        ),
                      }}
                    >
                      {getInitials(`${child.firstName} ${child.lastName}`)}
                    </div>
                    <div className="student-info">
                      <h4>
                        {child.firstName} {child.lastName}
                      </h4>
                      <span className="student-grade">
                        {child.grade}° Grado{" "}
                        {child.section ? `- Sección ${child.section}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="student-details">
                    <div className="student-detail">
                      <span>🏫</span>
                      <span>{child.institution?.name}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "12px", width: "100%" }}
                      onClick={() =>
                        handleOpenModal("qr", {
                          studentId: child.id,
                          studentName: `${child.firstName} ${child.lastName}`,
                        })
                      }
                    >
                      ➕ Generar Código QR
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {children.length === 0 && (
              <Card>
                <p style={{ textAlign: "center", color: "var(--gray-500)" }}>
                  No tienes hijos registrados en el sistema.
                </p>
              </Card>
            )}
          </>
        )}

        {activeTab === "authorized" && (
          <Card
            title="Personas Autorizadas"
            subtitle={`${authorizedPersons.length} personas pueden retirar a tus hijos`}
            actions={
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal("authorized")}
              >
                ➕ Nueva Persona
              </button>
            }
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Relación</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {authorizedPersons.map((person) => (
                    <tr key={person.id}>
                      <td className="font-semibold">
                        {person.firstName} {person.lastName}
                      </td>
                      <td>{person.dni}</td>
                      <td>{person.relationship}</td>
                      <td>{person.phoneNumber}</td>
                      <td>
                        <span
                          className={`badge ${
                            person.isActive
                              ? "status-confirmed"
                              : "status-rejected"
                          }`}
                        >
                          {person.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {authorizedPersons.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--gray-500)",
                  padding: "20px",
                }}
              >
                No tienes personas autorizadas registradas.
              </p>
            )}
          </Card>
        )}

        {activeTab === "codes" && (
          <Card
            title="Códigos QR Generados"
            subtitle="Historial de códigos para retiros"
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Autorizado</th>
                    <th>Fecha Creación</th>
                    <th>Expira</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalCodes.map((code) => (
                    <tr key={code.id}>
                      <td className="font-mono text-sm">{code.code}</td>
                      <td>
                        {code.student?.firstName} {code.student?.lastName}
                      </td>
                      <td>
                        {code.authorizedPerson?.firstName}{" "}
                        {code.authorizedPerson?.lastName}
                      </td>
                      <td>{formatDateTime(code.createdAt)}</td>
                      <td>{formatDateTime(code.expiresAt)}</td>
                      <td>
                        <span
                          className={`badge ${getStatusClass(code.status)}`}
                        >
                          {translateStatus(code.status)}
                        </span>
                      </td>
                      <td>
                        {code.status === "PENDING" && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleCopyCode(code.code)}
                          >
                            📋 Copiar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {withdrawalCodes.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--gray-500)",
                  padding: "20px",
                }}
              >
                No has generado ningún código QR aún.
              </p>
            )}
          </Card>
        )}
      </div>

      <Modal
        isOpen={showModal && modalType === "authorized"}
        onClose={handleCloseModal}
        title="Registrar Persona Autorizada"
      >
        <form onSubmit={handleRegisterAuthorizedPerson}>
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
            <label className="form-label">Relación *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Tío, Abuelo, Hermano"
              value={formData.relationship || ""}
              onChange={(e) =>
                setFormData({ ...formData, relationship: e.target.value })
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
              Registrar Persona
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showModal && modalType === "qr"}
        onClose={handleCloseModal}
        title={`Generar Código QR - ${formData.studentName}`}
      >
        <form onSubmit={handleGenerateQR}>
          <div className="form-group">
            <label className="form-label">Persona Autorizada *</label>
            <select
              className="form-select"
              value={formData.authorizedPersonId || ""}
              onChange={(e) =>
                setFormData({ ...formData, authorizedPersonId: e.target.value })
              }
              required
            >
              <option value="">Seleccionar...</option>
              {authorizedPersons
                .filter((p) => p.isActive)
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName} - {person.relationship}
                  </option>
                ))}
            </select>
          </div>

          <div className="alert alert-info">
            <strong>ℹ️ Importante:</strong> El código QR será válido por 24
            horas y debe ser presentado al guardia de seguridad para el retiro.
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
              Generar Código QR
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
