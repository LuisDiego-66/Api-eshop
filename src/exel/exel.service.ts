import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Order } from 'src/modules/orders/entities/order.entity';

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
}
