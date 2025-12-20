import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

import { Order } from 'src/modules/orders/entities/order.entity';
import { Variant } from 'src/modules/variants/entities/variant.entity';

@Injectable()
export class ExelService {
  //? ============================================================================================== */
  //?                                 Export_Orders                                                  */
  //? ============================================================================================== */

  async exportOrdersToExcel(
    result: { orders: Order[]; totalAmount: number },
    res: Response,
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Cabeceras
    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 10 },
      {
        header: 'Fecha',
        key: 'createdAt',
        width: 30,
        style: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
      },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Tipo Pago', key: 'paymentType', width: 15 },
      { header: 'Orden Editada', key: 'edit', width: 15 },
      { header: 'Total Orden', key: 'orderTotal', width: 15 },
    ];

    // Llenar filas
    for (const order of result.orders) {
      const row = worksheet.addRow({
        orderId: order.id,
        createdAt: this.toBoliviaDate(order.createdAt),
        status: order.status,
        tipo: order.type,
        paymentType: order.payment_type,
        edit: order.edited,
        orderTotal: Number(order.totalPrice),
      });

      const fillColor = this.getRowColor(order.status);

      if (fillColor) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor },
          };
        });
      }
    }
    worksheet.addRow({});
    worksheet.addRow({
      //summary: 'TOTAL GENERAL',
      orderTotal: result.totalAmount,
    });

    // Respuesta HTTP
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  //? ============================================================================================== */
  //? ============================================================================================== */

  private toBoliviaDate(date: Date): Date {
    return new Date(date.getTime() - 4 * 60 * 60 * 1000);
  }

  //? ============================================================================================== */
  //? ============================================================================================== */

  private getRowColor(status: string) {
    switch (status) {
      case 'cancelled':
        return 'FFFFC7CE'; // rojo claro
      case 'sent':
        return 'FFBDD7EE'; // azul claro
      case 'paid':
        return 'FFC6EFCE'; // verde claro
      default:
        return null;
    }
  }

  //? ============================================================================================== */
  //?                               Export_Variants                                                  */
  //? ============================================================================================== */

  async exportVariantsToExcel(
    res: Response,
    variants: Variant[],
    stockMap: Map<number, number>,
  ) {
    // Crear Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Variants');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      {
        header: 'Fecha creación',
        key: 'createdAt',
        width: 25,
        style: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
      },
      { header: 'Producto', key: 'product', width: 30 },
      { header: 'Color', key: 'color', width: 20 },
      { header: 'Talla', key: 'size', width: 15 },
      { header: 'Stock Disponible', key: 'stock', width: 18 },
      { header: 'Eliminado', key: 'deleted', width: 12 },
    ];

    // Llenar filas
    for (const variant of variants) {
      const stock = stockMap.get(variant.id) ?? 0;

      const row = worksheet.addRow({
        id: variant.id,
        createdAt: this.toBoliviaDate(variant.createdAt),
        product: variant.productColor?.product?.name ?? '',
        color: variant.productColor?.color.name ?? '',
        size: variant.size?.name ?? '',
        stock,
        deleted: variant.deletedAt ? 'Sí' : 'No',
      });

      // Color según stock
      if (stock === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' }, // rojo
          };
        });
      }
    }

    // Respuesta HTTP
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=variants_stock.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
