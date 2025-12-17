import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { envs } from 'src/config/environments/environments';

import { SendMailPaymentConfirmationDto } from './dto/sendmail-payment-confirmation.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(dto: SendMailPaymentConfirmationDto) {
    const { to } = dto;

    const context = {
      ...dto,
      /*orderNumber: '#12345',
      orderDate: '15 de Diciembre, 2025',
      totalPrice: '1,250.50',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      customerPhone: '+591 71234567',
      shippingAddress: 'Av. Principal #123',
      shippingCity: 'La Paz',
      shippingCountry: 'Bolivia', */

      shippingMethod: 'Envío Estándar (3-5 días hábiles)',
    };

    return this.mailerService.sendMail({
      to,
      subject: 'Confirmación de Pago de Pedido',
      cc: envs.MAIL_FROM,
      template: 'paid-order',
      context,
    });
  }
}
