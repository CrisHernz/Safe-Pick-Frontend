import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { childrenService } from "../services/childrenService";
import { withdrawalService } from "../services/withdrawalService";
import PickerCredentials from "./PickerCredentials";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout, hasRole } = useAuth();
  const [children, setChildren] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("children");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [retrievedCredentials, setRetrievedCredentials] = useState(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  useEffect(() => {
    if (hasRole("PARENT") || hasRole("GUARDIAN")) {
      loadChildren();
      loadWithdrawals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRole]);

  const loadChildren = async () => {
    try {
      setLoadingChildren(true);
      const data = await childrenService.getChildren();
      setChildren(data);
    } catch (err) {
      setError("Error al cargar hijos: " + err.message);
    } finally {
      setLoadingChildren(false);
    }
  };

  const loadWithdrawals = async () => {
    try {
      setLoadingWithdrawals(true);
      const data = await withdrawalService.getWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      setError("Error al cargar órdenes de retiro: " + err.message);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas cancelar esta orden de retiro?"
      )
    ) {
      return;
    }

    try {
      await withdrawalService.cancelWithdrawal(orderId);
      setError("");
      await loadWithdrawals();
      if (selectedOrder?.id === orderId) {
        handleCloseOrderDetails();
      }
    } catch (err) {
      setError("Error al cancelar orden: " + err.message);
    }
  };

  const handleViewCredentials = async (orderId) => {
    try {
      setLoadingCredentials(true);
      setError("");
      const credentials = await withdrawalService.getPickerCredentials(orderId);
      setRetrievedCredentials(credentials);
      setShowCredentials(true);
    } catch (err) {
      setError("Error al obtener credenciales: " + err.message);
    } finally {
      setLoadingCredentials(false);
    }
  };

  const handleCloseCredentials = () => {
    setShowCredentials(false);
    setRetrievedCredentials(null);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>SafePick Dashboard</h1>
          <div className="user-info">
            <span>Bienvenido, {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-logout">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="tabs">
          {(hasRole("PARENT") || hasRole("GUARDIAN")) && (
            <>
              <button
                className={`tab ${activeTab === "children" ? "active" : ""}`}
                onClick={() => setActiveTab("children")}
              >
                Mis Hijos
              </button>
              <button
                className={`tab ${activeTab === "withdrawals" ? "active" : ""}`}
                onClick={() => setActiveTab("withdrawals")}
              >
                Órdenes de Retiro
              </button>
            </>
          )}
        </div>

        {activeTab === "children" && (
          <div className="tab-content">
            <h2>Mis Hijos</h2>
            {loadingChildren ? (
              <p>Cargando...</p>
            ) : children.length === 0 ? (
              <p>No tienes hijos registrados</p>
            ) : (
              <div className="children-grid">
                {children.map((child) => (
                  <div key={child.id} className="child-card">
                    <h3>{child.name}</h3>
                    <p>
                      <strong>Grado:</strong> {child.grade}
                    </p>
                    <p>
                      <strong>Escuela:</strong> {child.school}
                    </p>
                    <a
                      href={`/withdraw/${child.id}`}
                      className="btn btn-primary"
                    >
                      Crear Orden de Retiro
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="tab-content">
            <h2>Órdenes de Retiro</h2>
            {loadingWithdrawals ? (
              <p>Cargando...</p>
            ) : withdrawals.length === 0 ? (
              <p>No tienes órdenes de retiro</p>
            ) : (
              <div className="withdrawals-list">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="withdrawal-card"
                    onClick={() => handleViewOrderDetails(withdrawal)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="withdrawal-header">
                      <h3>{withdrawal.child?.name}</h3>
                      <span
                        className={`status ${withdrawal.status.toLowerCase()}`}
                      >
                        {withdrawal.status}
                      </span>
                    </div>
                    <p>
                      <strong>Quién recoge:</strong> {withdrawal.picker?.name}
                    </p>
                    <p>
                      <strong>Relación:</strong>{" "}
                      {withdrawal.picker?.relationship}
                    </p>
                    <p>
                      <strong>Fecha de retiro:</strong>{" "}
                      {withdrawal.withdrawalDate
                        ? new Date(withdrawal.withdrawalDate).toLocaleString(
                            "es-ES"
                          )
                        : "Pendiente"}
                    </p>
                    <p>
                      <strong>Creado:</strong>{" "}
                      {new Date(withdrawal.createdAt).toLocaleString("es-ES")}
                    </p>
                    <div
                      className="card-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewOrderDetails(withdrawal)}
                      >
                        Ver Detalles
                      </button>
                      {withdrawal.status === "PENDING" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(withdrawal.id);
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalles de la orden */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Orden</h2>
              <button className="modal-close" onClick={handleCloseOrderDetails}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <h3>📋 Información de la Orden</h3>
                <p>
                  <strong>Hijo:</strong> {selectedOrder.child?.name}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`status ${selectedOrder.status.toLowerCase()}`}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
                <p>
                  <strong>Fecha de retiro:</strong>{" "}
                  {selectedOrder.withdrawalDate
                    ? new Date(selectedOrder.withdrawalDate).toLocaleString(
                        "es-ES"
                      )
                    : "Pendiente"}
                </p>
                <p>
                  <strong>Creado:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("es-ES")}
                </p>
              </div>

              {selectedOrder.pickerCredentials ? (
                <PickerCredentials
                  pickerCredentials={selectedOrder.pickerCredentials}
                  qrToken={selectedOrder.qrCode}
                  qrData={{
                    orderId: selectedOrder.id,
                    childName: selectedOrder.child.name,
                    pickerName: selectedOrder.picker.name,
                    pickerCedula: selectedOrder.picker.cedula,
                    relationship: selectedOrder.picker.relationship,
                    createdAt: selectedOrder.createdAt,
                  }}
                  orderId={selectedOrder.id}
                />
              ) : (
                <div className="credentials-notice">
                  {selectedOrder.picker && (
                    <>
                      <div className="picker-basic-info">
                        <h3>Información del Picker</h3>
                        <p>
                          <strong>Nombre:</strong> {selectedOrder.picker.name}
                        </p>
                        <p>
                          <strong>Cédula:</strong> {selectedOrder.picker.cedula}
                        </p>
                        <p>
                          <strong>Relación:</strong>{" "}
                          {selectedOrder.picker.relationship}
                        </p>
                        {selectedOrder.picker.codeExpiresAt && (
                          <p>
                            <strong>Válido hasta:</strong>{" "}
                            {new Date(
                              selectedOrder.picker.codeExpiresAt
                            ).toLocaleString("es-ES")}
                          </p>
                        )}
                      </div>
                      {(selectedOrder.status === "VALIDATED" ||
                        selectedOrder.status === "PENDING") && (
                        <button
                          className="btn btn-view-credentials"
                          onClick={() =>
                            handleViewCredentials(selectedOrder.id)
                          }
                          disabled={loadingCredentials}
                        >
                          {loadingCredentials
                            ? "Generando nuevo código..."
                            : "Ver Credenciales"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="modal-actions">
                {selectedOrder.status === "PENDING" && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                  >
                    Cancelar Orden
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseOrderDetails}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar credenciales recuperadas */}
      {showCredentials && retrievedCredentials && (
        <div className="modal-overlay" onClick={handleCloseCredentials}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Credenciales del Picker</h2>
              <button className="modal-close" onClick={handleCloseCredentials}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                Se ha generado un nuevo código temporal. Compártelo con el
                picker.
              </div>
              <PickerCredentials
                pickerCredentials={retrievedCredentials.pickerCredentials}
                qrToken={retrievedCredentials.qrToken}
                qrData={retrievedCredentials.qrData}
                orderId={selectedOrder?.id}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCloseCredentials}
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

export default Dashboard;
