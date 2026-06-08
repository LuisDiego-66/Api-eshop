import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { envs } from 'src/config/environments/environments';

import { SendMailPaymentConfirmationDto } from './dto/sendmail-payment-confirmation.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendFacturaEmail(
    to: string,
    numeroFactura: number,
    razonSocial: string,
    xmlBuffer: Buffer,
    pdfBuffer: Buffer,
  ) {
    return this.mailerService.sendMail({
      to,
      subject: `Factura N° ${numeroFactura} - ${razonSocial}`,
      html: `
        <p>Estimado equipo,</p>
        <p>Se adjunta la <strong>Factura N° ${numeroFactura}</strong> para revisión y pruebas con el SIAT.</p>
        <p>Los archivos adjuntos son:</p>
        <ul>
          <li><b>factura-${numeroFactura}.pdf</b> — Representación gráfica</li>
          <li><b>factura-${numeroFactura}.xml</b> — Archivo XML</li>
        </ul>
      `,
      attachments: [
        {
          filename: `factura-${numeroFactura}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
        {
          filename: `factura-${numeroFactura}.xml`,
          content: xmlBuffer,
          contentType: 'application/xml',
        },
      ],
    });
  }

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
