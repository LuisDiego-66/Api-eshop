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
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Variants');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID Variante', key: 'id', width: 15 },
      { header: 'Producto', key: 'product', width: 30 },
      { header: 'Color', key: 'color', width: 20 },
      { header: 'Talla', key: 'size', width: 15 },
      { header: 'Stock Disponible', key: 'stock', width: 18 },
      {
        header: 'Fecha creación',
        key: 'createdAt',
        width: 25,
        style: { numFmt: 'dd/mm/yyyy hh:mm:ss' },
      },
    ];

    // --------------------------------------------------
    // 1. Agrupar: Producto → Color
    // --------------------------------------------------
    const grouped = new Map<string, Map<string, Variant[]>>();

    for (const variant of variants) {
      const productName = variant.productColor?.product?.name ?? 'Sin producto';
      const colorName = variant.productColor?.color?.name ?? 'Sin color';

      if (!grouped.has(productName)) {
        grouped.set(productName, new Map());
      }

      const colorMap = grouped.get(productName)!;

      if (!colorMap.has(colorName)) {
        colorMap.set(colorName, []);
      }

      colorMap.get(colorName)!.push(variant);
    }

    // --------------------------------------------------
    // 2. Construir Excel
    // --------------------------------------------------

    for (const [productName, colors] of grouped) {
      // Fila Producto - SOLO en columna Producto
      const productRow = worksheet.addRow({
        id: '', // ID vacío
        product: `${productName}`, // Producto aquí
        color: '', // Color vacío
        size: '', // Talla vacía
        stock: '', // Stock vacío
        createdAt: '', // Fecha vacía
      });

      worksheet.mergeCells(`B${productRow.number}:F${productRow.number}`);

      productRow.font = { bold: true, size: 14 };
      productRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
      };

      for (const [colorName, variants] of colors) {
        // Fila Color - SOLO en columna Color
        const colorRow = worksheet.addRow({
          id: '', // ID vacío
          product: '', // Producto vacío
          color: `${colorName}`, // Color aquí
          size: '', // Talla vacía
          stock: '', // Stock vacío
          createdAt: '', // Fecha vacía
        });

        worksheet.mergeCells(`C${colorRow.number}:F${colorRow.number}`);

        colorRow.font = { bold: true };
        colorRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEDEDED' },
        };

        // Variantes
        for (const variant of variants) {
          const stock = stockMap.get(variant.id) ?? 0;

          const row = worksheet.addRow({
            id: variant.id, // ID de la variante
            product: '', // Producto vacío
            color: '', // Color vacío
            size: variant.size?.name ?? '', // Talla aquí
            stock, // Stock aquí
            createdAt: this.toBoliviaDate(variant.createdAt), // Fecha aquí
          });

          // Pintar stock 0
          if (stock === 0) {
            row.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFC7CE' },
              };
            });
          }
        }
      }

      // Espacio entre productos
      worksheet.addRow({});
    }

    // --------------------------------------------------
    // 3. Respuesta HTTP
    // --------------------------------------------------
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

  //? ============================================================================================== */
  //?             Export_Variants_Whit_Transaccions                                                  */
  //? ============================================================================================== */

  // Función alternativa para organizar los datos como en tu ejemplo visual
  async exportvariantsTransactionsToExcel(products: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario Agrupado');

    // Ordenar productos
    const sortedProducts = products.sort((a, b) => {
      const productCompare = a.productColor.product.name.localeCompare(
        b.productColor.product.name,
      );
      if (productCompare !== 0) return productCompare;
      const colorCompare = a.productColor.color.name.localeCompare(
        b.productColor.color.name,
      );
      if (colorCompare !== 0) return colorCompare;
      return parseInt(a.size.name) - parseInt(b.size.name);
    });

    let currentRow = 1;

    // Agrupar por producto y color
    const groupedProducts = new Map();
    sortedProducts.forEach((product) => {
      const key = `${product.productColor.product.name}|${product.productColor.color.name}`;
      if (!groupedProducts.has(key)) {
        groupedProducts.set(key, []);
      }
      groupedProducts.get(key).push(product);
    });

    // Escribir datos agrupados
    groupedProducts.forEach((products, key) => {
      const [productName, colorName] = key.split('|');

      // Encabezado de producto
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const productCell = worksheet.getCell(`A${currentRow}`);
      productCell.value = productName;
      productCell.font = { bold: true, size: 12 };
      currentRow++;

      // Color
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const colorCell = worksheet.getCell(`A${currentRow}`);
      colorCell.value = colorName;
      colorCell.font = { italic: true };
      currentRow++;
      currentRow++; // Espacio

      // Para cada talla de este producto/color
      products.forEach((product) => {
        // ID y Talla
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        const idCell = worksheet.getCell(`A${currentRow}`);
        idCell.value = `Id ${product.id} | Talla ${product.size.name}`;
        idCell.font = { bold: true };
        currentRow++;

        // Encabezados de transacciones
        worksheet.getCell(`A${currentRow}`).value = 'Tipo';
        worksheet.getCell(`B${currentRow}`).value = 'Cantidad';
        worksheet.getCell(`C${currentRow}`).value = 'Fecha';
        const headerRow = worksheet.getRow(currentRow);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8E8E8' },
          };
        });
        currentRow++;

        // Transacciones ordenadas por fecha
        const sortedTransactions = product.transactions.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        sortedTransactions.forEach((transaction) => {
          const type = transaction.quantity > 0 ? 'Ingreso' : 'Salida';
          const quantity = Math.abs(transaction.quantity);
          const date = this.toBoliviaDate(new Date(transaction.createdAt));

          worksheet.getCell(`A${currentRow}`).value = type;
          worksheet.getCell(`B${currentRow}`).value = quantity;
          worksheet.getCell(`C${currentRow}`).value = date;

          // Color de fila
          const row = worksheet.getRow(currentRow);
          const fillColor = transaction.quantity > 0 ? 'FFC6EFCE' : 'FFFFC7CE';
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: fillColor },
            };
          });

          currentRow++;
        });

        // Calcular y mostrar stock total
        const totalStock = product.transactions.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );
        currentRow++;
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const stockCell = worksheet.getCell(`A${currentRow}`);
        stockCell.value = `Stock Actual: ${totalStock}`;
        stockCell.font = { bold: true };
        stockCell.alignment = { horizontal: 'right' };
        currentRow += 2; // Espacio entre productos
      });
    });

    // Ajustar anchos
    worksheet.columns = [
      { width: 20 },
      { width: 12 },
      { width: 25 },
      { width: 15 },
    ];

    // Configurar respuesta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=variants_transactions.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
