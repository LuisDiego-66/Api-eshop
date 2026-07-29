import { PaymentType } from '../enums';

//! Catálogo SIAT "Método de Pago" (RND facturación electrónica).
//! Verificar contra sincronizarParametricaTipoMetodoPago si el código real difiere.
export const METODO_PAGO_SIAT: Record<PaymentType, number> = {
  [PaymentType.CASH]: 1, // Efectivo
  [PaymentType.QR]: 7, // Pago QR
  [PaymentType.CARD]: 2, // Tarjeta (aún no habilitado en el sistema)
};
