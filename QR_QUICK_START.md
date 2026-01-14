# 🚀 GUÍA RÁPIDA - Generación QR en SafePick

## ✅ **Instalación Completada**

```bash
npm install qrcode html5-qrcode
```

---

## 📦 **Componentes Creados**

### 1. **WithdrawalQRCode.js** - Generar y Mostrar QR
**Ubicación:** `src/components/WithdrawalQRCode.js`

**Props:**
```javascript
<WithdrawalQRCode 
  qrToken="eyJvcmRlcklkIjoiY201YWJjMTIzLi4uIi..."  // Token del backend
  qrData={{                                         // Datos de la orden
    orderId: "cm5abc123...",
    childName: "Sofía García",
    pickerName: "Roberto García",
    pickerCedula: "3334445556",
    relationship: "padre",
    createdAt: "2026-01-13T10:30:00.000Z"
  }}
  orderId="cm5abc123..."
/>
```

**Funcionalidades:**
- ✅ Genera QR automáticamente
- ✅ Descarga del QR como imagen
- ✅ Compartir QR (si el navegador lo soporta)
- ✅ Muestra información de la orden
- ✅ Responsive

---

### 2. **QRScanner.js** - Escanear y Validar QR
**Ubicación:** `src/components/QRScanner.js`

**Uso:**
```javascript
import QRScanner from './components/QRScanner';

function GuardianDashboard() {
  return (
    <div>
      <h1>Panel de Guardia</h1>
      <QRScanner />
    </div>
  );
}
```

**Funcionalidades:**
- ✅ Escanea QR con la cámara
- ✅ Valida automáticamente con el backend
- ✅ Muestra información completa de la orden
- ✅ Permite completar el retiro
- ✅ Manejo de errores
- ✅ Compatible con React 19

---

## 🔧 **Integración en CreateWithdrawal**

Ahora voy a mostrar cómo integrar el componente QR en tu flujo existente:

**CreateWithdrawal.js (actualizado):**

```javascript
import React, { useState } from 'react';
import WithdrawalQRCode from './WithdrawalQRCode';
import withdrawalService from '../services/withdrawalService';

function CreateWithdrawal({ childId }) {
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await withdrawalService.create({
        childId: childId,
        pickerName: formData.pickerName,
        pickerCedula: formData.pickerCedula,
        pickerPhone: formData.pickerPhone,
        relationship: formData.relationship,
      });

      // Guardar los datos de la orden
      setOrderData({
        orderId: response.withdrawalOrderId,
        qrToken: response.qrToken,
        qrData: response.qrData,
      });
      
      setOrderCreated(true);
    } catch (error) {
      console.error('Error creando orden:', error);
      alert('Error al crear la orden de retiro');
    } finally {
      setLoading(false);
    }
  };

  // Si la orden ya fue creada, mostrar el QR
  if (orderCreated && orderData) {
    return (
      <div>
        <WithdrawalQRCode 
          qrToken={orderData.qrToken}
          qrData={orderData.qrData}
          orderId={orderData.orderId}
        />
        <button onClick={() => {
          setOrderCreated(false);
          setOrderData(null);
        }}>
          ← Volver al Dashboard
        </button>
      </div>
    );
  }

  // Mostrar formulario
  return (
    <div>
      {/* Tu formulario actual aquí */}
    </div>
  );
}
```

---

## 📋 **API Backend (Ya implementada)**

### **Crear Orden con QR**
```http
POST /withdrawals
Authorization: Bearer <token>

{
  "childId": "cm5xyz123...",
  "pickerName": "Roberto García",
  "pickerCedula": "3334445556",
  "pickerPhone": "+34333444555",
  "relationship": "padre"
}
```

**Response:**
```json
{
  "withdrawalOrderId": "cm5abc123...",
  "message": "Withdrawal order created successfully",
  "qrToken": "eyJvcmRlcklkIjoiY201YWJjMTIzLi4uIi...",
  "qrData": {
    "orderId": "cm5abc123...",
    "childId": "cm5xyz123...",
    "childName": "Sofía García",
    "pickerName": "Roberto García",
    "pickerCedula": "3334445556",
    "relationship": "padre",
    "createdAt": "2026-01-13T10:30:00.000Z"
  }
}
```

---

### **Validar QR (Guardia)**
```http
POST /withdrawals/validate-qr
Authorization: Bearer <token_guardia>

{
  "qrToken": "eyJvcmRlcklkIjoiY201YWJjMTIzLi4uIi..."
}
```

**Response Exitosa:**
```json
{
  "valid": true,
  "order": {
    "id": "cm5abc123...",
    "status": "VALIDATED",
    "child": { ... },
    "picker": { ... },
    "parent": { ... }
  },
  "message": "QR válido. Orden lista para completar."
}
```

---

### **Completar Retiro**
```http
POST /withdrawals/:orderId/complete
Authorization: Bearer <token_guardia>
```

---

## 🎯 **Flujo Completo**

```
1. PADRE → Llena formulario con datos del picker
           ↓
2. BACKEND → Crea orden y genera qrToken
           ↓
3. FRONTEND → Muestra componente WithdrawalQRCode
           ↓
4. PADRE → Descarga/guarda el QR
           ↓
5. GUARDIA → Abre QRScanner component
           ↓
6. GUARDIA → Escanea QR con cámara
           ↓
7. BACKEND → Valida qrToken y retorna datos
           ↓
8. FRONTEND → Muestra datos de niño, picker y padre
           ↓
9. GUARDIA → Verifica identidad física
           ↓
10. GUARDIA → Click en "Completar Retiro"
           ↓
11. BACKEND → Estado → COMPLETED ✅
```

---

## 🔐 **Seguridad Implementada**

- ✅ Token codificado en Base64
- ✅ Validación backend del token
- ✅ Verificación de cédula del picker
- ✅ Solo estados VALIDATED pueden completarse
- ✅ JWT requerido para todas las operaciones
- ✅ Roles específicos (PARENT, GUARDIAN)

---

## ✅ **Próximos Pasos**

1. ✅ **Backend implementado** con generación y validación de QR
2. ✅ **Componentes creados** (WithdrawalQRCode + QRScanner)
3. ⏳ **Integrar WithdrawalQRCode** en CreateWithdrawal
4. ⏳ **Crear ruta para guardias** con QRScanner
5. ⏳ **Probar flujo completo**

---

## 🛠️ **Solución de Problemas**

### **Error de dependencias React 19:**
✅ **Solucionado** - Usamos `html5-qrcode` en vez de `react-qr-reader`

### **Cámara no funciona:**
- Verificar permisos del navegador
- HTTPS requerido en producción
- Usar Chrome/Firefox/Safari modernos

### **QR no se genera:**
- Verificar que `qrToken` no esté vacío
- Revisar consola del navegador
- Verificar respuesta del backend

---

## 📱 **Compatibilidad**

- ✅ React 19
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Android y iOS (con HTTPS)
- ✅ Desktop y Mobile

---

¡Todo listo para implementar! 🚀
