export enum OrderStatus {
  SENT = 'sent', //! orden enviada

  PAID = 'paid', //! la orden ya fue pagada pero no ha sido enviada

  PENDING = 'pending', //! esta en medio de una transaccion

  CANCELLED = 'cancelled', //! se cancelo la orden pagada o pendiente

  CANCELLEDFOREDIT = 'cancelled_for_edit',

  EXPIRED = 'expired', //! la orden expirada porque se paso el tiempo para ser pagada
}
