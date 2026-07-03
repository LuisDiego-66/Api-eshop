import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import { Factura } from '../entities/factura.entity';
import { CodigoEmisionEnum } from '../enums/codigo-emision.enum';
import { envs } from 'src/config/environments/environments';

@Injectable()
export class FacturaPdfService {
  async generate(factura: Factura): Promise<Buffer> {
    const qrUrl = `${envs.SIAT_QR_URL}?nit=${factura.nitEmisor}&cuf=${factura.cuf}&numero=${factura.numeroFactura}&t=2`;
    const qrBuffer = await QRCode.toBuffer(qrUrl, { type: 'png', width: 100 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      this.buildContent(doc, factura, qrBuffer);
      doc.end();
    });
  }

  private buildContent(doc: PDFKit.PDFDocument, f: Factura, qrBuffer: Buffer): void {
    const LX = 40;
    const PW = 515; // content width (595 - 2*40)
    const RX = LX + PW;

    // ── ENCABEZADO IZQUIERDO ─────────────────────────────────────────────
    const sucursal =
      f.codigoSucursal === 0
        ? 'CASA MATRIZ'
        : `SUCURSAL N. ${f.codigoSucursal}`;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(f.razonSocialEmisor, LX, 40, { width: 250 });
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(sucursal, LX)
      .text(f.direccion, LX)
      .text(`Teléfono: ${f.telefono}`, LX)
      .text(f.municipio, LX);

    // ── ENCABEZADO DERECHO ────────────────────────────────────────────────
    const RL = 330; // right label start
    const RV = 390; // right value start
    let ry = 40;

    const addRightRow = (label: string, value: string) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(label, RL, ry, { width: 60 });
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(value, RV, ry, { width: 165 });
      ry += 14;
    };

    addRightRow('NIT', String(f.nitEmisor));
    addRightRow('FACTURA N°', String(f.numeroFactura));
    addRightRow('CUF', f.cuf);
    if (f.cafc) {
      addRightRow('CAFC', f.cafc.codigo);
    }

    // ── SEPARADOR ────────────────────────────────────────────────────────
    let y = Math.max(doc.y, ry) + 8;
    doc.moveTo(LX, y).lineTo(RX, y).lineWidth(1).stroke();
    y += 10;

    // ── TÍTULO ──────────────────────────────────────────────────────────
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('FACTURA', LX, y, { width: PW, align: 'center' });
    y += 22;

    const creditoLabel =
      Number(f.montoTotalSujetoIva) > 0
        ? '(Con Derecho a Crédito Fiscal)'
        : '(Sin Derecho a Crédito Fiscal)';
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(creditoLabel, LX, y, { width: PW, align: 'center' });
    y += 20;

    doc.moveTo(LX, y).lineTo(RX, y).stroke();
    y += 10;

    // ── DATOS DEL CLIENTE ────────────────────────────────────────────────
    const fechaStr = new Date(f.fechaEmision).toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.font('Helvetica-Bold').fontSize(9).text('Fecha:', LX, y);
    doc
      .font('Helvetica')
      .text(fechaStr, LX + 45, y, { width: 180, continued: false });

    doc.font('Helvetica-Bold').text('NIT/CI/CEX:', LX + 270, y);
    doc.font('Helvetica').text(f.numeroDocumento, LX + 340, y, { width: 175 });
    y += 16;

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Nombre/Razón Social:', LX, y);
    doc
      .font('Helvetica')
      .text(f.nombreRazonSocial, LX + 130, y, { width: 385 });
    y += 16;

    doc.moveTo(LX, y).lineTo(RX, y).stroke();
    y += 8;

    // ── CABECERA DE TABLA ────────────────────────────────────────────────
    const cols = {
      code: { x: LX, w: 70 },
      qty: { x: LX + 70, w: 50 },
      desc: { x: LX + 120, w: 175 },
      price: { x: LX + 295, w: 65 },
      disc: { x: LX + 360, w: 65 },
      sub: { x: LX + 425, w: 90 },
    };

    doc.font('Helvetica-Bold').fontSize(8);
    doc.text('CÓDIGO', cols.code.x + 2, y, { width: cols.code.w });
    doc.text('CANTIDAD', cols.qty.x, y, { width: cols.qty.w, align: 'center' });
    doc.text('DESCRIPCIÓN', cols.desc.x, y, {
      width: cols.desc.w,
      align: 'center',
    });
    doc.text('P. UNITARIO', cols.price.x, y, {
      width: cols.price.w,
      align: 'right',
    });
    doc.text('DESCUENTO', cols.disc.x, y, {
      width: cols.disc.w,
      align: 'right',
    });
    doc.text('SUBTOTAL', cols.sub.x, y, { width: cols.sub.w, align: 'right' });
    y += 16;

    doc.moveTo(LX, y).lineTo(RX, y).stroke();
    y += 6;

    // ── FILAS DE DETALLE ─────────────────────────────────────────────────
    doc.font('Helvetica').fontSize(8);
    for (const det of f.detalles ?? []) {
      doc.text(det.codigoProducto, cols.code.x + 2, y, { width: cols.code.w });
      doc.text(String(det.cantidad), cols.qty.x, y, {
        width: cols.qty.w,
        align: 'center',
      });
      doc.text(det.descripcion, cols.desc.x, y, { width: cols.desc.w });
      doc.text(Number(det.precioUnitario).toFixed(2), cols.price.x, y, {
        width: cols.price.w,
        align: 'right',
      });
      doc.text(Number(det.montoDescuento ?? 0).toFixed(2), cols.disc.x, y, {
        width: cols.disc.w,
        align: 'right',
      });
      doc.text(Number(det.subTotal).toFixed(2), cols.sub.x, y, {
        width: cols.sub.w,
        align: 'right',
      });
      y += 16;
    }

    doc.moveTo(LX, y).lineTo(RX, y).stroke();
    y += 6;

    // ── TOTALES ──────────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('TOTAL BS', cols.disc.x, y, {
      width: cols.disc.w,
      align: 'right',
    });
    doc.text(Number(f.montoTotal).toFixed(2), cols.sub.x, y, {
      width: cols.sub.w,
      align: 'right',
    });
    y += 14;

    doc.text('IMPORTE BASE CRÉDITO FISCAL', cols.desc.x, y, {
      width: cols.desc.w + cols.price.w + cols.disc.w,
      align: 'right',
    });
    doc.text(Number(f.montoTotalSujetoIva).toFixed(2), cols.sub.x, y, {
      width: cols.sub.w,
      align: 'right',
    });
    y += 24;

    // ── MONTO EN PALABRAS ────────────────────────────────────────────────
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(
        `Son: ${this.numberToWords(Number(f.montoTotal))} Bolivianos`,
        LX,
        y,
      );
    y += 22;

    // ── TEXTO LEGAL ──────────────────────────────────────────────────────
    doc.moveTo(LX, y).lineTo(RX, y).stroke();
    y += 8;

    doc
      .fontSize(7)
      .font('Helvetica')
      .text(
        '"ESTA FACTURA CONTRIBUYE AL DESARROLLO DE NUESTRO PAIS, EL USO ILÍCITO DE ÉSTA SERÁ SANCIONADO DE ACUERDO A LEY"',
        LX,
        y,
        { width: PW, align: 'center' },
      );
    y += 14;

    if (f.leyenda) {
      doc.text(f.leyenda, LX, y, { width: PW, align: 'center' });
      y += 14;
    }

    const modalidadText =
      Number(f.codigoEmision) === CodigoEmisionEnum.OFFLINE
        ? 'Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación fuera de línea'
        : 'Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea';

    doc
      .fontSize(7)
      .font('Helvetica')
      .text(modalidadText, LX, y, { width: PW, align: 'center' });
    y += 14;

    doc.image(qrBuffer, LX, y, { width: 80, height: 80 });
    doc
      .fontSize(7)
      .font('Helvetica')
      .text('Escanea para verificar', LX, y + 82, { width: 80, align: 'center' });
  }

  private numberToWords(n: number): string {
    const intPart = Math.floor(n);
    const decPart = Math.round((n - intPart) * 100);

    const words = this.intToWords(intPart);
    const dec = String(decPart).padStart(2, '0');
    return `${words} ${dec}/100`;
  }

  private intToWords(n: number): string {
    if (n === 0) return 'cero';

    const units = [
      '',
      'un',
      'dos',
      'tres',
      'cuatro',
      'cinco',
      'seis',
      'siete',
      'ocho',
      'nueve',
      'diez',
      'once',
      'doce',
      'trece',
      'catorce',
      'quince',
      'dieciséis',
      'diecisiete',
      'dieciocho',
      'diecinueve',
      'veinte',
    ];
    const tens = [
      '',
      '',
      'veinti',
      'treinta',
      'cuarenta',
      'cincuenta',
      'sesenta',
      'setenta',
      'ochenta',
      'noventa',
    ];
    const hundreds = [
      '',
      'ciento',
      'doscientos',
      'trescientos',
      'cuatrocientos',
      'quinientos',
      'seiscientos',
      'setecientos',
      'ochocientos',
      'novecientos',
    ];

    if (n <= 20) return units[n];
    if (n < 30) return 'veinti' + units[n - 20];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const u = n % 10;
      return tens[t] + (u ? ' y ' + units[u] : '');
    }
    if (n === 100) return 'cien';
    if (n < 1000) {
      const h = Math.floor(n / 100);
      const rest = n % 100;
      return hundreds[h] + (rest ? ' ' + this.intToWords(rest) : '');
    }
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      const prefix =
        thousands === 1 ? 'mil' : this.intToWords(thousands) + ' mil';
      return prefix + (rest ? ' ' + this.intToWords(rest) : '');
    }
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    const prefix =
      millions === 1
        ? 'un millón'
        : this.intToWords(millions) + ' millones';
    return prefix + (rest ? ' ' + this.intToWords(rest) : '');
  }
}
