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
} from "../../utils/helpers";
import "./Dashboard.css";

export default function GuardiaDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [validations, setValidations] = useState([]);
  const [pendingCodes, setPendingCodes] = useState([]);
  const [scannedCode, setScannedCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [guardNotes, setGuardNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("scanner");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, validationsData, pendingData] = await Promise.all([
        apiService.getGuardStats(),
        apiService.getMyValidations(),
        apiService.getPendingCodes(),
      ]);

      setStats(statsData);
      setValidations(validationsData);
      setPendingCodes(pendingData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanCode = async (e) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;

    try {
      setError("");
      const result = await apiService.validateCode(scannedCode);
      setValidationResult(result);
      setShowConfirmModal(true);
    } catch (err) {
      setError(err.message);
      setValidationResult(null);
    }
  };

  const handleConfirmWithdrawal = async () => {
    try {
      await apiService.confirmWithdrawal(validationResult.id, guardNotes);
      setSuccess("Retiro confirmado exitosamente");
      setShowConfirmModal(false);
      setValidationResult(null);
      setScannedCode("");
      setGuardNotes("");
      await loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectWithdrawal = async () => {
    const reason = prompt("Ingrese el motivo del rechazo:");
    if (!reason) return;

    try {
      await apiService.rejectWithdrawal(validationResult.id, reason);
      setSuccess("Retiro rechazado");
      setShowConfirmModal(false);
      setValidationResult(null);
      setScannedCode("");
      await loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
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
            <h1 className="dashboard-title">Panel de Guardia</h1>
            <p className="dashboard-subtitle">
              Validación de códigos QR para retiros
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

        <div className="stats-grid">
          <StatCard
            title="Total Validaciones"
            value={stats?.totalValidations || 0}
            icon="📊"
            color="primary"
          />
          <StatCard
            title="Hoy"
            value={stats?.todayValidations || 0}
            icon="📅"
            color="success"
          />
          <StatCard
            title="Este Mes"
            value={stats?.monthValidations || 0}
            icon="📈"
            color="warning"
          />
          <StatCard
            title="Pendientes"
            value={pendingCodes.length}
            icon="⏳"
            color="danger"
          />
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "scanner" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("scanner")}
          >
            📷 Escanear QR
          </button>
          <button
            className={`tab ${activeTab === "pending" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            ⏳ Pendientes
          </button>
          <button
            className={`tab ${activeTab === "history" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📋 Historial
          </button>
        </div>

        {activeTab === "scanner" && (
          <Card
            title="Escanear Código QR"
            subtitle="Ingrese o escanee el código del retiro"
          >
            <div className="scanner-container">
              <form
                onSubmit={handleScanCode}
                style={{ width: "100%", maxWidth: "500px" }}
              >
                <div className="form-group">
                  <input
                    type="text"
                    className="scanner-input"
                    placeholder="QR-XXXXXXXXXX"
                    value={scannedCode}
                    onChange={(e) =>
                      setScannedCode(e.target.value.toUpperCase())
                    }
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%" }}
                >
                  🔍 Validar Código
                </button>
              </form>

              <div className="alert alert-info" style={{ maxWidth: "500px" }}>
                <strong>💡 Tip:</strong> Use un lector de códigos QR conectado o
                ingrese el código manualmente
              </div>
            </div>
          </Card>
        )}

        {activeTab === "pending" && (
          <Card
            title="Códigos Pendientes"
            subtitle={`${pendingCodes.length} códigos esperando validación`}
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Persona Autorizada</th>
                    <th>Generado</th>
                    <th>Expira</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCodes.map((code) => (
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
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setScannedCode(code.code);
                            setActiveTab("scanner");
                          }}
                        >
                          Validar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pendingCodes.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--gray-500)",
                  padding: "20px",
                }}
              >
                No hay códigos pendientes de validación
              </p>
            )}
          </Card>
        )}

        {activeTab === "history" && (
          <Card
            title="Historial de Validaciones"
            subtitle="Mis validaciones recientes"
          >
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Retirado por</th>
                    <th>Estado</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {validations.map((validation) => (
                    <tr key={validation.id}>
                      <td>{formatDateTime(validation.withdrawalTime)}</td>
                      <td className="font-mono text-sm">{validation.code}</td>
                      <td>
                        {validation.student?.firstName}{" "}
                        {validation.student?.lastName}
                      </td>
                      <td>
                        {validation.authorizedPerson?.firstName}{" "}
                        {validation.authorizedPerson?.lastName}
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusClass(
                            validation.status
                          )}`}
                        >
                          {translateStatus(validation.status)}
                        </span>
                      </td>
                      <td>{validation.guardNotes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {validations.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--gray-500)",
                  padding: "20px",
                }}
              >
                No hay validaciones registradas
              </p>
            )}
          </Card>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setValidationResult(null);
        }}
        title="Confirmar Retiro"
        size="lg"
      >
        {validationResult && (
          <>
            <div className="scanner-result">
              <div className="validation-info">
                <div className="validation-item">
                  <span className="validation-label">Código</span>
                  <span className="validation-value font-mono">
                    {validationResult.code}
                  </span>
                </div>
                <div className="validation-item">
                  <span className="validation-label">Estudiante</span>
                  <span className="validation-value">
                    {validationResult.student?.firstName}{" "}
                    {validationResult.student?.lastName}
                  </span>
                </div>
                <div className="validation-item">
                  <span className="validation-label">Grado</span>
                  <span className="validation-value">
                    {validationResult.student?.grade}°{" "}
                    {validationResult.student?.section}
                  </span>
                </div>
                <div className="validation-item">
                  <span className="validation-label">Autorizado</span>
                  <span className="validation-value">
                    {validationResult.authorizedPerson?.firstName}{" "}
                    {validationResult.authorizedPerson?.lastName}
                  </span>
                </div>
                <div className="validation-item">
                  <span className="validation-label">Relación</span>
                  <span className="validation-value">
                    {validationResult.authorizedPerson?.relationship}
                  </span>
                </div>
                <div className="validation-item">
                  <span className="validation-label">DNI</span>
                  <span className="validation-value">
                    {validationResult.authorizedPerson?.dni}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label">Notas del Guardia (Opcional)</label>
              <textarea
                className="form-textarea"
                placeholder="Ingrese observaciones si las hubiera..."
                value={guardNotes}
                onChange={(e) => setGuardNotes(e.target.value)}
                rows="3"
              />
            </div>

            <div className="alert alert-warning">
              <strong>⚠️ Importante:</strong> Verifique la identidad de la
              persona autorizada antes de confirmar el retiro.
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRejectWithdrawal}
              >
                ❌ Rechazar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmWithdrawal}
              >
                ✅ Confirmar Retiro
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
