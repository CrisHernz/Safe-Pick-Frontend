// Servicio de Órdenes de Retiro
import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../config/api";

export const withdrawalService = {
  /**
   * Obtiene la lista de órdenes de retiro del usuario
   * @returns {Promise<Array>} Array de órdenes de retiro
   */
  async getWithdrawals() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WITHDRAWALS.GET_ALL);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una orden de retiro específica
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Datos de la orden
   */
  async getWithdrawalById(orderId) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.WITHDRAWALS.GET_BY_ID(orderId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crea una nueva orden de retiro
   * @param {Object} withdrawalData - Datos de la orden
   * @returns {Promise<Object>} Orden creada con QR code
   */
  async createWithdrawal(withdrawalData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WITHDRAWALS.CREATE, {
        childId: withdrawalData.childId,
        pickerName: withdrawalData.pickerName,
        pickerCedula: withdrawalData.pickerCedula,
        pickerPhone: withdrawalData.pickerPhone,
        relationship: withdrawalData.relationship,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Completa una orden de retiro (solo ADMIN o PICKER)
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Orden completada
   */
  async completeWithdrawal(orderId) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.WITHDRAWALS.COMPLETE(orderId),
        {}
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancela una orden de retiro (solo PARENT o GUARDIAN)
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Orden cancelada
   */
  async cancelWithdrawal(orderId) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.WITHDRAWALS.CANCEL(orderId),
        {}
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene las credenciales del picker (regenera código temporal)
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Credenciales del picker
   */
  async getPickerCredentials(orderId) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.WITHDRAWALS.GET_CREDENTIALS(orderId),
        {}
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};
