import { PaymentType } from '../enums';

//! Catálogo SIAT "Método de Pago" (RND facturación electrónica).
//! Verificar contra sincronizarParametricaTipoMetodoPago si el código real difiere.
export const METODO_PAGO_SIAT: Record<PaymentType, number> = {
  [PaymentType.CASH]: 1, // Efectivo
  [PaymentType.QR]: 7, // Pago QR
  //! Tarjeta se factura como Efectivo (1): el sistema no captura numeroTarjeta
  //! en ningún punto, y el SIAT rechaza la factura si el método es Tarjeta (2)
  //! sin ese dato. Revertir a 2 solo si se implementa la captura del dato.
  [PaymentType.CARD]: 1, //2
};
