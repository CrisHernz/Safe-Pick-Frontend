import React, { useState, useEffect, useCallback } from "react";
import apiService from "../../services/api.service";
import QRCode from "qrcode";
import PhoneInput from "../common/PhoneInput";
import "./PadreDashboard.css";

export default function PadreDashboard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeView, setActiveView] = useState("children");
  const [showModal, setShowModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState({
    pickerName: "",
    pickerCedula: "",
    relationship: "",
    pickerPhone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [_qrDataUrl, setQrDataUrl] = useState(""); // eslint-disable-line no-unused-vars
  const [submitting, setSubmitting] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramBotUsername, _setTelegramBotUsername] =
    useState("safe_pick_uio_bot");
  const [telegramLinking, setTelegramLinking] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [skipTelegramWarning, setSkipTelegramWarning] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [childrenData, ordersData, userProfile] = await Promise.all([
        apiService.getMyChildren(),
        apiService.getWithdrawalOrders(),
        apiService.getUserProfile(),
      ]);
      setChildren(childrenData || []);
      setOrders(ordersData || []);
      setHasTelegram(!!userProfile?.telegramChatId);
    } catch (err) {
      // Error silencioso - los datos vacíos ya indican que no hay información
      setChildren([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Función para encriptar los datos del QR (simulando la encriptación del backend)
  const generateEncryptedQR = async (qrToken) => {
    try {
      // El qrToken ya viene encriptado/codificado del backend en base64
      // Generamos el QR con ese token
      const qrImage = await QRCode.toDataURL(qrToken, {
        width: 280,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      return qrImage;
    } catch (err) {
      throw err;
    }
  };

  // Función interna para ejecutar la creación de orden
  const executeCreateOrder = async (orderData) => {
    setSubmitting(true);
    try {
      const result = await apiService.createWithdrawalOrder(orderData);

      // Generar QR con el token encriptado
      const qrImage = await generateEncryptedQR(result.qrToken);

      // Preparar credenciales para mostrar
      setCredentials({
        cedula: orderData.pickerCedula,
        temporaryCode:
          result.pickerCredentials?.temporaryCode || result.temporaryCode,
        pickerName: orderData.pickerName,
        childName: selectedChild.name,
        qrToken: result.qrToken,
        expiresAt: result.pickerCredentials?.expiresAt,
        orderId: result.withdrawalOrderId,
      });
      setQrDataUrl(qrImage);
      setShowCredentials(true);
      setShowModal(false);
      setShowTelegramModal(false);
      setPendingOrderData(null);
      setSkipTelegramWarning(false);
      setSuccess(
        hasTelegram
          ? "¡Orden creada! Recibirás notificación cuando retiren al niño."
          : "¡Orden creada! Recuerda que NO recibirás notificación del retiro.",
      );

      // Recargar datos
      await loadData();
    } catch (err) {
      setError(
        "No se pudo crear la orden. Verifica los datos e intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const orderData = {
      childId: selectedChild.id,
      pickerName: formData.pickerName,
      pickerCedula: formData.pickerCedula,
      relationship: formData.relationship,
      pickerPhone: formData.pickerPhone,
    };

    // Si no tiene Telegram configurado, mostrar advertencia primero
    if (!hasTelegram) {
      setPendingOrderData(orderData);
      setShowModal(false);
      setShowTelegramModal(true);
      return;
    }

    // Si tiene Telegram, crear orden directamente
    await executeCreateOrder(orderData);
  };

  // Función para continuar sin Telegram (aceptando el riesgo)
  const handleContinueWithoutTelegram = async () => {
    if (!pendingOrderData) return;
    setSkipTelegramWarning(false);
    await executeCreateOrder(pendingOrderData);
  };

  const handleGetCredentials = async (orderId) => {
    try {
      setError("");
      const result = await apiService.getPickerCredentials(orderId);
      const order = orders.find((o) => o.id === orderId);

      // Generar QR con el token encriptado
      const qrImage = await generateEncryptedQR(result.qrToken);

      setCredentials({
        cedula: result.pickerCredentials.cedula,
        temporaryCode: result.pickerCredentials.temporaryCode,
        pickerName:
          result.pickerInfo?.name || order?.picker?.name || "Encargado",
        childName: order?.child?.name || "Niño/a",
        qrToken: result.qrToken,
        expiresAt: result.pickerCredentials?.expiresAt,
        orderId: orderId,
      });
      setQrDataUrl(qrImage);
      setShowCredentials(true);
    } catch (err) {
      setError("No se pudieron obtener las credenciales. Intenta nuevamente.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("¿Estás seguro de cancelar esta orden de retiro?")) {
      return;
    }

    try {
      setError("");
      await apiService.cancelWithdrawalOrder(orderId);
      setSuccess("Orden cancelada exitosamente");
      await loadData();
    } catch (err) {
      setError("No se pudo cancelar la orden. Intenta nuevamente.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: "Pendiente", emoji: "⏳", color: "#ff9800" },
      VALIDATED: { text: "Lista", emoji: "✅", color: "#4caf50" },
      COMPLETED: { text: "Completada", emoji: "🎉", color: "#2196f3" },
      CANCELLED: { text: "Cancelada", emoji: "❌", color: "#d32f2f" },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span
        className="status-badge"
        style={{ background: badge.color + "20", color: badge.color }}
      >
        {badge.emoji} {badge.text}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="sp-loading-container">
        <div className="sp-loading-card">
          <div className="sp-spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-dashboard">
      {/* Header */}
      <header className="sp-header">
        <div className="sp-header-content">
          <div className="sp-header-info">
            <h1>SafePick</h1>
            <p>Hola, {user.name || "Padre"}</p>
          </div>
          <div className="sp-header-actions">
            <button
              onClick={() => {
                setPendingOrderData(null);
                setSkipTelegramWarning(false);
                setShowTelegramModal(true);
              }}
              className={`sp-btn-telegram ${hasTelegram ? "linked" : ""}`}
              title={
                hasTelegram
                  ? "Telegram vinculado ✓"
                  : "Vincular Telegram para notificaciones"
              }
            >
              {hasTelegram ? "📱✓" : "📱"}
            </button>
            <button onClick={handleLogout} className="sp-btn-logout">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="sp-main">
        {/* Alerts */}
        {error && (
          <div className="sp-alert sp-alert-error">
            <span>❌</span> {error}
            <button onClick={() => setError("")} className="sp-alert-close">
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="sp-alert sp-alert-success">
            <span>✅</span> {success}
            <button onClick={() => setSuccess("")} className="sp-alert-close">
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="sp-tabs">
          <button
            onClick={() => setActiveView("children")}
            className={`sp-tab ${activeView === "children" ? "active" : ""}`}
          >
            <span className="sp-tab-icon">👶</span>
            <span className="sp-tab-text">Mis Hijos</span>
            <span className="sp-tab-count">{children.length}</span>
          </button>
          <button
            onClick={() => setActiveView("orders")}
            className={`sp-tab ${activeView === "orders" ? "active" : ""}`}
          >
            <span className="sp-tab-icon">📋</span>
            <span className="sp-tab-text">Órdenes</span>
            <span className="sp-tab-count">{orders.length}</span>
          </button>
        </div>

        {/* Children View */}
        {activeView === "children" && (
          <section className="sp-section">
            {children.length === 0 ? (
              <div className="sp-empty-state">
                <div className="sp-empty-icon">👶</div>
                <h3>No hay hijos registrados</h3>
                <p>Contacta con la institución para registrar a tus hijos</p>
              </div>
            ) : (
              <div className="sp-cards-list">
                {children.map((child) => (
                  <div key={child.id} className="sp-card">
                    <div className="sp-card-header">
                      <div className="sp-card-avatar">👦</div>
                      <div className="sp-card-title">
                        <h3>{child.name}</h3>
                        <span>{child.grade}° Grado</span>
                      </div>
                    </div>
                    <div className="sp-card-body">
                      <div className="sp-card-info">
                        <span className="sp-info-label">Colegio</span>
                        <span className="sp-info-value">{child.school}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChild(child);
                        setShowModal(true);
                        setError("");
                        setFormData({
                          pickerName: "",
                          pickerCedula: "",
                          relationship: "",
                          pickerPhone: "",
                        });
                      }}
                      className="sp-btn sp-btn-primary"
                    >
                      Crear Orden de Retiro
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Orders View */}
        {activeView === "orders" && (
          <section className="sp-section">
            {orders.length === 0 ? (
              <div className="sp-empty-state">
                <div className="sp-empty-icon">📋</div>
                <h3>No hay órdenes de retiro</h3>
                <p>Crea una orden desde la sección de hijos</p>
              </div>
            ) : (
              <div className="sp-cards-list">
                {orders.map((order) => (
                  <div key={order.id} className="sp-card">
                    <div className="sp-card-header">
                      <div className="sp-card-title">
                        <h3>{order.child?.name}</h3>
                        <span>Encargado: {order.picker?.name}</span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="sp-card-body">
                      <div className="sp-card-info">
                        <span className="sp-info-label">Relación</span>
                        <span className="sp-info-value">
                          {order.picker?.relationship}
                        </span>
                      </div>
                      <div className="sp-card-info">
                        <span className="sp-info-label">Cédula</span>
                        <span className="sp-info-value">
                          {order.picker?.cedula}
                        </span>
                      </div>
                      <div className="sp-card-info">
                        <span className="sp-info-label">Creada</span>
                        <span className="sp-info-value">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      {order.status === "COMPLETED" && order.withdrawalDate && (
                        <div className="sp-card-info sp-completed">
                          <span className="sp-info-label">Completada</span>
                          <span className="sp-info-value">
                            {formatDate(order.withdrawalDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acciones según estado */}
                    {(order.status === "PENDING" ||
                      order.status === "VALIDATED") && (
                      <div className="sp-card-actions">
                        <button
                          onClick={() => handleGetCredentials(order.id)}
                          className="sp-btn sp-btn-primary"
                        >
                          🔑 Ver Credenciales
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="sp-btn sp-btn-danger"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    {order.status === "COMPLETED" && (
                      <div className="sp-status-message sp-success">
                        ✅ Retiro completado exitosamente
                      </div>
                    )}

                    {order.status === "CANCELLED" && (
                      <div className="sp-status-message sp-error">
                        ❌ Esta orden fue cancelada
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Modal Create Order */}
        {showModal && (
          <div className="sp-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sp-modal-header">
                <h2>Nueva Orden de Retiro</h2>
                <p>Para: {selectedChild?.name}</p>
              </div>

              <form onSubmit={handleCreateOrder} className="sp-form">
                <div className="sp-form-group">
                  <label>Nombre del encargado</label>
                  <input
                    type="text"
                    value={formData.pickerName}
                    onChange={(e) =>
                      setFormData({ ...formData, pickerName: e.target.value })
                    }
                    placeholder="Nombre completo"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="sp-form-group">
                  <label>Cédula de identidad</label>
                  <input
                    type="text"
                    value={formData.pickerCedula}
                    onChange={(e) => {
                      const onlyDigits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData({ ...formData, pickerCedula: onlyDigits });
                    }}
                    placeholder="1712345678"
                    required
                    disabled={submitting}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                  />
                </div>

                <div className="sp-form-group">
                  <label>Relación con el niño</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship: e.target.value })
                    }
                    required
                    disabled={submitting}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="abuelo">Abuelo</option>
                    <option value="abuela">Abuela</option>
                    <option value="tío">Tío</option>
                    <option value="tía">Tía</option>
                    <option value="hermano">Hermano</option>
                    <option value="hermana">Hermana</option>
                    <option value="otro">Otro Familiar</option>
                  </select>
                </div>

                <div className="sp-form-group">
                  <PhoneInput
                    label="Teléfono de contacto"
                    id="picker-phone"
                    name="pickerPhone"
                    value={formData.pickerPhone}
                    onChange={(phoneValue) =>
                      setFormData({ ...formData, pickerPhone: phoneValue })
                    }
                    required
                    disabled={submitting}
                    helperText="Selecciona el país y escribe solo los dígitos"
                  />
                </div>

                {error && (
                  <div className="sp-alert sp-alert-error">{error}</div>
                )}

                <div className="sp-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="sp-btn sp-btn-secondary"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="sp-btn sp-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Creando..." : "Crear Orden"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Credentials & QR */}
        {showCredentials && credentials && (
          <div
            className="sp-modal-overlay"
            onClick={() => setShowCredentials(false)}
          >
            <div
              className="sp-modal sp-modal-credentials"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sp-modal-header sp-success-header">
                <h2>✅ Credenciales Generadas</h2>
                <p>Para recoger a: {credentials.childName}</p>
              </div>
              <div className="sp-credentials-box">
                <div className="sp-credential-item">
                  <span className="sp-credential-label">ENCARGADO</span>
                  <span className="sp-credential-value">
                    {credentials.pickerName}
                  </span>
                </div>

                <div className="sp-credential-item">
                  <span className="sp-credential-label">CÉDULA (USUARIO)</span>
                  <span className="sp-credential-value sp-mono">
                    {credentials.cedula}
                  </span>
                </div>

                <div className="sp-credential-item sp-highlight">
                  <span className="sp-credential-label">CÓDIGO TEMPORAL</span>
                  <span className="sp-credential-code">
                    {credentials.temporaryCode}
                  </span>
                </div>
              </div>
              {/* QR Code Display
              {qrDataUrl && (
                <div className="sp-qr-section">
                  <h3>Código QR Encriptado</h3>
                  <div className="sp-qr-container">
                    <img src={qrDataUrl} alt="QR Code" />
                  </div>
                  <p className="sp-qr-hint">
                    Este QR contiene datos encriptados que solo el guardia puede
                    verificar
                  </p>
                </div>
              )} */}
              <div className="sp-warning-box">
                <span>⏰</span>
                <div>
                  <strong>Válido hasta las 2:00 PM</strong>
                  <p>El código expira automáticamente después de esta hora</p>
                </div>
              </div>
              <div className="sp-instructions">
                <h4>Instrucciones para {credentials.pickerName}:</h4>
                <ol>
                  <li>
                    Ir a <strong>{window.location.origin}/picker-login</strong>
                  </li>
                  <li>
                    Ingresar cédula: <strong>{credentials.cedula}</strong>
                  </li>
                  <li>
                    Ingresar código:{" "}
                    <strong>{credentials.temporaryCode}</strong>
                  </li>
                  <li>Mostrar el QR al guardia de seguridad</li>
                  <li>El guardia verificará y completará el retiro</li>
                </ol>
              </div>
              <button
                onClick={() => {
                  setShowCredentials(false);
                  setQrDataUrl("");
                }}
                className="sp-btn sp-btn-primary"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Telegram Configuration Modal */}
        {showTelegramModal && (
          <div className="sp-modal-overlay">
            <div className="sp-modal sp-telegram-modal">
              <h2>
                {pendingOrderData
                  ? "⚠️ Configurar Notificaciones"
                  : "📱 Notificaciones de Telegram"}
              </h2>

              {hasTelegram ? (
                <div className="sp-telegram-linked-success">
                  <span>✅</span>
                  <div>
                    <strong>¡Telegram vinculado correctamente!</strong>
                    <p>Recibirás notificaciones cuando retiren a tu hijo/a.</p>
                  </div>
                  <button
                    onClick={() => setShowTelegramModal(false)}
                    className="sp-btn sp-btn-primary"
                    style={{ marginTop: "16px", width: "100%" }}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <p className="sp-telegram-explanation">
                    {pendingOrderData ? (
                      <>
                        <strong>Importante:</strong> Para tu seguridad, te
                        recomendamos vincular Telegram para recibir una
                        notificación inmediata cuando retiren a tu hijo/a.
                      </>
                    ) : (
                      <>
                        Vincula tu cuenta de Telegram para recibir
                        notificaciones cuando retiren a tu hijo/a del colegio.
                      </>
                    )}
                  </p>

                  {!skipTelegramWarning ? (
                    <>
                      <div className="sp-telegram-steps">
                        <div className="sp-telegram-step">
                          <span className="sp-step-number">1</span>
                          <div>
                            <strong>Abre Telegram</strong>
                            <p>En tu celular o computadora</p>
                          </div>
                        </div>

                        <div className="sp-telegram-step">
                          <span className="sp-step-number">2</span>
                          <div>
                            <strong>Busca el bot</strong>
                            <p className="sp-telegram-bot">
                              @{telegramBotUsername}
                            </p>
                          </div>
                        </div>

                        <div className="sp-telegram-step">
                          <span className="sp-step-number">3</span>
                          <div>
                            <strong>Inicia el chat</strong>
                            <p>
                              Envía <code>/start</code> o cualquier mensaje
                            </p>
                          </div>
                        </div>

                        <div className="sp-telegram-step">
                          <span className="sp-step-number">4</span>
                          <div>
                            <strong>Vuelve aquí</strong>
                            <p>Y haz clic en "Verificar vinculación"</p>
                          </div>
                        </div>
                      </div>

                      <div className="sp-telegram-actions">
                        <a
                          href={`https://t.me/${telegramBotUsername}?start=USER_ID_${
                            user.id || ""
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sp-btn sp-btn-primary"
                        >
                          📱 Abrir en Telegram
                        </a>

                        <button
                          onClick={async () => {
                            setTelegramLinking(true);
                            try {
                              await new Promise((resolve) =>
                                setTimeout(resolve, 2000),
                              );
                              const userData =
                                await apiService.getUserProfile();

                              if (userData.telegramChatId) {
                                setHasTelegram(true);
                                setSuccess("¡Telegram vinculado exitosamente!");
                                // Ahora crear la orden automáticamente
                                if (pendingOrderData) {
                                  setShowTelegramModal(false);
                                  await executeCreateOrder(pendingOrderData);
                                }
                              } else {
                                setError(
                                  "No se detectó la vinculación. Asegúrate de haber enviado /start al bot.",
                                );
                              }
                            } catch (err) {
                              setError(
                                "No se pudo verificar la vinculación. Intenta nuevamente.",
                              );
                            } finally {
                              setTelegramLinking(false);
                            }
                          }}
                          className="sp-btn sp-btn-secondary"
                          disabled={telegramLinking}
                        >
                          {telegramLinking
                            ? "Verificando..."
                            : "✓ Verificar vinculación"}
                        </button>

                        {pendingOrderData ? (
                          <button
                            onClick={() => setSkipTelegramWarning(true)}
                            className="sp-btn sp-btn-text sp-btn-danger-text"
                          >
                            Omitir y continuar sin notificaciones
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowTelegramModal(false)}
                            className="sp-btn sp-btn-text"
                          >
                            Cerrar
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="sp-warning-danger">
                        <span className="sp-warning-icon">🚨</span>
                        <div>
                          <strong>¡Advertencia de Seguridad!</strong>
                          <p>
                            Si continúas sin vincular Telegram,{" "}
                            <strong>NO recibirás ninguna notificación</strong>{" "}
                            cuando retiren a tu hijo/a del colegio.
                          </p>
                          <p>
                            Esto significa que no sabrás en tiempo real si
                            alguien recoge a tu hijo, lo cual puede representar
                            un <strong>riesgo de seguridad</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="sp-telegram-actions">
                        <button
                          onClick={() => setSkipTelegramWarning(false)}
                          className="sp-btn sp-btn-primary"
                        >
                          ← Volver y vincular Telegram
                        </button>

                        <button
                          onClick={handleContinueWithoutTelegram}
                          className="sp-btn sp-btn-danger"
                          disabled={submitting}
                        >
                          {submitting
                            ? "Creando..."
                            : "Entiendo el riesgo, continuar"}
                        </button>

                        <button
                          onClick={() => {
                            setShowTelegramModal(false);
                            setSkipTelegramWarning(false);
                            setPendingOrderData(null);
                            setShowModal(true);
                          }}
                          className="sp-btn sp-btn-text"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
