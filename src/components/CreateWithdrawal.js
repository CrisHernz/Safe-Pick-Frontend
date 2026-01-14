import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { childrenService } from "../services/childrenService";
import { withdrawalService } from "../services/withdrawalService";
import { validation } from "../utils/validation";
import { RELATIONSHIPS } from "../config/api";
import PickerCredentials from "./PickerCredentials";
import "./CreateWithdrawal.css";

function CreateWithdrawal() {
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [pickerCredentials, setPickerCredentials] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    pickerName: "",
    pickerCedula: "",
    pickerPhone: "",
    relationship: "tío",
  });

  useEffect(() => {
    loadChild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const loadChild = async () => {
    try {
      setLoading(true);
      const data = await childrenService.getChildById(childId);
      setChild(data);
    } catch (err) {
      setError("Error al cargar datos del hijo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!validation.isValidPickerName(formData.pickerName)) {
      errors.pickerName = "El nombre debe tener entre 3 y 100 caracteres";
    }

    if (!validation.isValidCedula(formData.pickerCedula)) {
      errors.pickerCedula = "Cédula debe tener entre 8 y 13 dígitos";
    }

    if (!validation.isValidPhone(formData.pickerPhone)) {
      errors.pickerPhone = "Formato de teléfono inválido (ej: +34123456789)";
    }

    if (!RELATIONSHIPS.includes(formData.relationship)) {
      errors.relationship = "Relación inválida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");
    setQrCode(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await withdrawalService.createWithdrawal({
        childId: childId,
        pickerName: formData.pickerName,
        pickerCedula: formData.pickerCedula,
        pickerPhone: formData.pickerPhone,
        relationship: formData.relationship,
      });

      setSuccessMessage("¡Orden de retiro creada exitosamente!");

      // Save all response data
      if (response.withdrawalOrderId) {
        setOrderId(response.withdrawalOrderId);
      }
      if (response.qrToken) {
        setQrCode(response.qrToken);
      }
      if (response.pickerCredentials) {
        setPickerCredentials(response.pickerCredentials);
      }
      if (response.qrData) {
        setQrData(response.qrData);
      }

      // Resetear formulario
      setFormData({
        pickerName: "",
        pickerCedula: "",
        pickerPhone: "",
        relationship: "tío",
      });

      // Redirigir después de 15 segundos
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 15000);
    } catch (err) {
      setError("Error al crear orden de retiro: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  if (!child) {
    return (
      <div className="error-container">
        <p>No se encontró información del hijo</p>
        <a href="/dashboard">Volver al dashboard</a>
      </div>
    );
  }

  return (
    <div className="create-withdrawal-container">
      <div className="create-withdrawal-card">
        <div className="back-link">
          <a href="/dashboard">← Volver</a>
        </div>

        <h1>Crear Orden de Retiro</h1>

        <div className="child-info">
          <h2>{child.name}</h2>
          <p>
            <strong>Grado:</strong> {child.grade}
          </p>
          <p>
            <strong>Escuela:</strong> {child.school}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {!qrCode ? (
          <form onSubmit={handleSubmit}>
            <h3>Datos de quien recoge</h3>
            <br />

            <div className="form-group">
              <label htmlFor="pickerName">Nombre Completo *</label>
              <input
                type="text"
                id="pickerName"
                name="pickerName"
                value={formData.pickerName}
                onChange={handleChange}
                placeholder="María García"
                required
              />
              {validationErrors.pickerName && (
                <span className="error-message">
                  {validationErrors.pickerName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="pickerCedula">Cédula *</label>
              <input
                type="text"
                id="pickerCedula"
                name="pickerCedula"
                value={formData.pickerCedula}
                onChange={handleChange}
                placeholder="87654321"
                required
              />
              {validationErrors.pickerCedula && (
                <span className="error-message">
                  {validationErrors.pickerCedula}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="pickerPhone">Teléfono *</label>
              <input
                type="tel"
                id="pickerPhone"
                name="pickerPhone"
                value={formData.pickerPhone}
                onChange={handleChange}
                placeholder="+34987654321"
                required
              />
              {validationErrors.pickerPhone && (
                <span className="error-message">
                  {validationErrors.pickerPhone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="relationship">Relación *</label>
              <select
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel.charAt(0).toUpperCase() + rel.slice(1)}
                  </option>
                ))}
              </select>
              {validationErrors.relationship && (
                <span className="error-message">
                  {validationErrors.relationship}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Creando orden..." : "Crear Orden de Retiro"}
            </button>
          </form>
        ) : (
          <div className="success-container">
            <div className="alert alert-success">
              <h3>✅ ¡Orden de Retiro Generada Exitosamente!</h3>
              <p>
                Comparte las credenciales y el código QR con la persona que
                recogerá al niño.
              </p>
            </div>

            {pickerCredentials && qrCode && (
              <PickerCredentials
                pickerCredentials={pickerCredentials}
                qrToken={qrCode}
                qrData={qrData}
                orderId={orderId}
              />
            )}

            <div className="redirect-notice">
              <p>📱 Serás redirigido al dashboard en 15 segundos...</p>
              <a href="/dashboard" className="btn btn-secondary">
                Ir al Dashboard ahora
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateWithdrawal;
