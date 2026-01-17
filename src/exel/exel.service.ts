import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

import { Variant } from 'src/modules/variants/entities/variant.entity';

@Injectable()
export class ExelService {
  //? ============================================================================================== */
  //?                                 Export_Orders                                                  */
  //? ============================================================================================== */

  async exportOrdersTotal(result: { orders: any[] }, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // -------------------------------
    // AGRUPAR ITEMS POR PRODUCTO
    // -------------------------------
    const productsMap = new Map<number, { product: any; items: any[] }>();
    for (const order of result.orders) {
      for (const item of order.items) {
        if (!item.variant || !item.variant.productColor) continue;
        const productId = item.variant.productColor.product.id;
        if (!productsMap.has(productId)) {
          productsMap.set(productId, {
            product: item.variant.productColor.product,
            items: [],
          });
        }
        productsMap.get(productId)!.items.push(item);
      }
    }

    // -------------------------------
    // CONSTRUIR EXCEL
    // -------------------------------
    for (const { product, items } of productsMap.values()) {
      // ---- TÍTULO PRODUCTO ----
      const productRow = worksheet.addRow([product.id, product.name]);
      worksheet.mergeCells(`B${productRow.number}:H${productRow.number}`);
      productRow.font = { bold: true, size: 14 };
      productRow.alignment = { wrapText: true, vertical: 'middle' };
      productRow.height = 30;
      productRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
      };
      worksheet.getColumn(2).width = 40;

      worksheet.addRow({}); // separación

      // ---- DETECTAR TALLAS ----
      const sizeSet = new Set<string>();
      for (const item of items) sizeSet.add(item.variant.size.name);
      const sizes = Array.from(sizeSet).sort((a, b) => {
        const order = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
        return order.indexOf(a) - order.indexOf(b);
      });

      // ---- ENCABEZADO ----
      const headerRow = worksheet.addRow(['Color', ...sizes, 'Total']);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center' };
      worksheet.getColumn(1).width = 22;
      for (let i = 2; i < 2 + sizes.length; i++)
        worksheet.getColumn(i).width = 8;

      // ---- FILAS POR COLOR ----
      const colorsMap = new Map<string, number[]>();
      for (const item of items) {
        const color = item.variant.productColor.color.name;
        if (!colorsMap.has(color))
          colorsMap.set(color, Array(sizes.length).fill(0));
        const idx = sizes.indexOf(item.variant.size.name);
        colorsMap.get(color)![idx] += item.quantity;
      }

      let generalTotal = 0;

      for (const [colorName, qtyArr] of colorsMap.entries()) {
        const row = worksheet.addRow([
          colorName,
          ...qtyArr,
          qtyArr.reduce((a, b) => a + b, 0),
        ]);
        generalTotal += qtyArr.reduce((a, b) => a + b, 0);

        row.getCell(1).alignment = { wrapText: true, vertical: 'middle' };

        row.eachCell((cell, colNumber) => {
          if (colNumber > 1)
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (typeof cell.value === 'number' && cell.value === 0)
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFC7CE' },
            };
        });
      }

      // ---- TOTAL GENERAL DEL BLOQUE ----
      const totalRow = worksheet.addRow([
        '',
        ...new Array(sizes.length).fill(''),
        generalTotal,
      ]);
      const totalCell = totalRow.getCell(sizes.length + 2);
      totalCell.font = { bold: true };
      totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
      totalCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF99' },
      };
      totalCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      worksheet.addRow({});
      worksheet.addRow({});
    }

    // -------------------------------
    // RESPUESTA HTTP
    // -------------------------------
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=ventas-totales.xlsx',
    );
    await workbook.xlsx.write(res);
    res.end();
  }

  //* ============================================================================================== */

  private toBoliviaDate(date: Date): Date {
    return new Date(date.getTime() - 4 * 60 * 60 * 1000);
  }

  //? ============================================================================================== */
  //?                           Export_Orders_Total                                                  */
  //? ============================================================================================== */

  async exportOrders(
    data: {
      orders: any[];
      totalAmount: number;
      dailyCashQuantity?: number | null;
    },
    res: Response,
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    let dailyCash: number | null = null;

    // Validar si dailyCashQuantity está presente en los datos
    if (data.dailyCashQuantity) {
      dailyCash = data.dailyCashQuantity;
    }

    let currentRow = 1;

    for (const order of data.orders) {
      // Filtrar items que tengan variant
      const validItems = order.items.filter(
        (item: any) => item.variant && item.variant.productColor,
      );

      // Omitir la orden si no tiene items válidos
      if (validItems.length === 0) continue;

      // ---------------------------
      // 1️⃣ Fila de cabecera de la orden
      // ---------------------------
      worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
      const orderRow = worksheet.getRow(currentRow);
      orderRow.values = [
        'Order ID',
        'Fecha',
        'Estado',
        'Tipo',
        'Tipo Pago',
        'Orden Editada',
        '',
        'Total Orden',
        dailyCash ? 'Daily Cash' : '',
      ];
      orderRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFB0C4DE' }, // azul claro
        };
      });
      currentRow++;

      // ---------------------------
      // 2️⃣ Fila con datos de la orden
      // ---------------------------
      const orderDataRow = worksheet.getRow(currentRow);
      orderDataRow.values = [
        order.id,
        new Date(order.createdAt).toLocaleString('es-BO'),
        order.status,
        order.type,
        order.payment_type,
        order.edited ? 'VERDADERO' : 'FALSO',
        '',
        parseFloat(order.totalPrice),
        dailyCash || '',
      ];
      orderDataRow.getCell(8).numFmt = '#,##0.00';
      currentRow++;

      // ---------------------------
      // 3️⃣ Fila de cabecera de items (subtítulos)
      // ---------------------------
      const itemsHeader = worksheet.getRow(currentRow);
      itemsHeader.values = [
        '',
        'Producto',
        'Color',
        'Talla',
        'Cantidad',
        'Precio Unit.',
        'Descuento',
        'Total',
      ];
      itemsHeader.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFD700' }, // dorado/amarillo
        };
      });
      currentRow++;

      // ---------------------------
      // 4️⃣ Filas de items
      // ---------------------------
      for (const item of validItems) {
        const itemRow = worksheet.getRow(currentRow);
        const productName = item.variant.productColor.product.name;

        itemRow.values = [
          '',
          productName,
          item.variant.productColor.color.name,
          item.variant.size.name,
          item.quantity,
          parseFloat(item.unit_price),
          parseFloat(item.discountValue),
          parseFloat(item.totalPrice),
        ];

        // Wrap text
        const productCell = itemRow.getCell(2);
        productCell.alignment = { wrapText: true, vertical: 'middle' };

        // Formato moneda
        itemRow.getCell(6).numFmt = '#,##0.00';
        itemRow.getCell(7).numFmt = '#,##0.00';
        itemRow.getCell(8).numFmt = '#,##0.00';

        // Ajuste altura según longitud del nombre
        if (productName.length > 30) {
          const lineCount = Math.ceil(productName.length / 40);
          itemRow.height = Math.max(20, lineCount * 18);
        } else {
          itemRow.height = 20;
        }

        currentRow++;
      }

      // ---------------------------
      // 5️⃣ Fila de total de la orden
      // ---------------------------
      const totalRow = worksheet.getRow(currentRow);
      totalRow.values = [
        '',
        '',
        '',
        '',
        '',
        '',
        'Total',
        parseFloat(order.totalPrice),
      ];
      totalRow.getCell(8).numFmt = '#,##0.00';
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber >= 7) {
          cell.font = { bold: true };
          cell.alignment = { horizontal: 'right' };
        }
      });
      totalRow.height = 25;
      currentRow += 2; // fila vacía
    }

    // ---------------------------
    // Total general de todas las órdenes
    // ---------------------------
    const grandTotalRow = worksheet.getRow(currentRow);
    grandTotalRow.values = [
      '',
      '',
      '',
      '',
      '',
      '',
      'TOTAL GENERAL',
      data.totalAmount,
    ];
    grandTotalRow.getCell(8).numFmt = '#,##0.00';
    grandTotalRow.eachCell((cell, colNumber) => {
      if (colNumber >= 7) {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'right' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }, // gris claro
        };
      }
    });
    grandTotalRow.height = 25;

    // ---------------------------
    // Ajuste automático de columnas
    // ---------------------------
    const totalColumns = worksheet.columnCount;
    for (let i = 1; i <= totalColumns; i++) {
      const column = worksheet.getColumn(i);
      let maxLength = 0;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : '';
        const lines = value.split(/\r?\n/);
        lines.forEach((line) => {
          if (line.length > maxLength) maxLength = line.length;
        });
      });

      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    }

    // ---------------------------
    // Enviar archivo al cliente
    // ---------------------------
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  //? ============================================================================================== */
  //?                               Export_Variants                                                  */
  //? ============================================================================================== */

  async exportVariants(
    res: Response,
    variants: Variant[],
    stockMap: Map<number, number>,
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Variants');

    // -------------------------------
    // 1) AGRUPAR Producto -> Color
    // -------------------------------
    const grouped = new Map<
      string,
      {
        productId: number | string;
        colors: Map<string, Variant[]>;
      }
    >();

    for (const variant of variants) {
      const product = variant.productColor?.product;
      const color = variant.productColor?.color;

      const productName = product?.name ?? 'Sin producto';
      const productId = product?.id ?? '';
      const colorName = color?.name ?? 'Sin color';

      if (!grouped.has(productName)) {
        grouped.set(productName, {
          productId,
          colors: new Map<string, Variant[]>(),
        });
      }

      const productGroup = grouped.get(productName)!;

      if (!productGroup.colors.has(colorName)) {
        productGroup.colors.set(colorName, []);
      }

      productGroup.colors.get(colorName)!.push(variant);
    }

    // -------------------------------
    // 2) CONSTRUIR EL EXCEL
    // -------------------------------
    for (const [productName, data] of grouped) {
      const productId = data.productId;
      const colors = data.colors;

      // ---- TÍTULO PRODUCTO ----
      const productRow = worksheet.addRow([productId, productName]);

      worksheet.mergeCells(`B${productRow.number}:H${productRow.number}`);

      productRow.font = { bold: true, size: 14 };
      productRow.alignment = { wrapText: true, vertical: 'middle' };
      productRow.height = 30;

      productRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
      };

      worksheet.getColumn(2).width = 40;

      worksheet.addRow({});

      // ---- TALLAS DINÁMICAS ----
      const sizeSet = new Set<string>();
      for (const variants of colors.values()) {
        for (const v of variants) {
          sizeSet.add(v.size?.name ?? '');
        }
      }

      const sizes = Array.from(sizeSet).sort((a, b) => {
        const order = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
        return order.indexOf(a) - order.indexOf(b);
      });

      // ---- ENCABEZADO ----
      const header = ['Color', ...sizes, 'Total'];
      const headerRow = worksheet.addRow(header);

      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center' };

      worksheet.getColumn(1).width = 22;
      for (let i = 2; i < 2 + sizes.length; i++) {
        worksheet.getColumn(i).width = 8;
      }

      let generalTotal = 0;

      // ---- FILAS POR COLOR ----
      for (const [colorName, variantsOfColor] of colors) {
        const sizeTotals = new Map<string, number>();
        sizes.forEach((s) => sizeTotals.set(s, 0));

        for (const v of variantsOfColor) {
          const sizeName = v.size?.name ?? '';
          const stock = stockMap.get(v.id) ?? 0;

          sizeTotals.set(sizeName, (sizeTotals.get(sizeName) ?? 0) + stock);
        }

        const rowData: (string | number)[] = [colorName];
        let colorTotal = 0;

        for (const s of sizes) {
          const value = sizeTotals.get(s) ?? 0;
          rowData.push(value);
          colorTotal += value;
        }

        rowData.push(colorTotal);
        generalTotal += colorTotal;

        const row = worksheet.addRow(rowData);

        row.getCell(1).alignment = { wrapText: true, vertical: 'middle' };

        row.eachCell((cell, colNumber) => {
          if (colNumber > 1) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }

          if (typeof cell.value === 'number' && cell.value === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFC7CE' },
            };
          }
        });
      }

      // -------------------------------
      //  TOTAL GENERAL SOLO EN SU CELDA
      // -------------------------------
      const totalRow = worksheet.addRow([
        '',
        ...new Array(sizes.length).fill(''),
        generalTotal,
      ]);

      // celda del total = última columna
      const totalCell = totalRow.getCell(sizes.length + 2);

      totalCell.font = { bold: true };
      totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
      totalCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF99' },
      };

      // opcional: borde alrededor del total
      totalCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      worksheet.addRow({});
      worksheet.addRow({});
    }

    // -------------------------------
    // 3) RESPUESTA HTTP
    // -------------------------------
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=productos-stock.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  //? ============================================================================================== */
  //?             Export_Variants_Whit_Transaccions                                                  */
  //? ============================================================================================== */

  async exportvariantsTransactions(products: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario Agrupado');

    // Ordenar productos por nombre, color y talla
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
      if (!groupedProducts.has(key)) groupedProducts.set(key, []);
      groupedProducts.get(key).push(product);
    });

    groupedProducts.forEach((products, key) => {
      const [productName, colorName] = key.split('|');

      // --- Producto ---
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const productCell = worksheet.getCell(`A${currentRow}`);
      productCell.value = productName;
      productCell.font = { bold: true, size: 12 };
      currentRow++;

      // --- Color ---
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const colorCell = worksheet.getCell(`A${currentRow}`);
      colorCell.value = colorName;
      colorCell.font = { italic: true };
      currentRow += 2; // Espacio

      // --- Cada talla ---
      products.forEach((product) => {
        // Id y talla
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        const idCell = worksheet.getCell(`A${currentRow}`);
        idCell.value = `Id ${product.id} | Talla ${product.size.name}`;
        idCell.font = { bold: true };
        currentRow++;

        // Encabezado de transacciones: Tipo, Motivo, Cantidad, Fecha
        const headerCols = ['A', 'B', 'C', 'D'];
        const headers = ['Tipo', 'Motivo', 'Cantidad', 'Fecha'];
        headerCols.forEach((col, i) => {
          const cell = worksheet.getCell(`${col}${currentRow}`);
          cell.value = headers[i];
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8E8E8' },
          };
        });
        currentRow++;

        // Transacciones ordenadas por fecha ascendente
        const sortedTransactions = product.transactions.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        sortedTransactions.forEach((transaction) => {
          // Determinar tipo
          let type = transaction.quantity > 0 ? 'Ingreso' : 'Venta';
          const hasReason =
            transaction.reason && transaction.reason.trim() !== '';

          if (hasReason) {
            type = 'Baja/Ajuste';
          }

          worksheet.getCell(`A${currentRow}`).value = type;
          worksheet.getCell(`B${currentRow}`).value = transaction.reason || '';
          worksheet.getCell(`C${currentRow}`).value = Math.abs(
            transaction.quantity,
          );
          worksheet.getCell(`D${currentRow}`).value = this.toBoliviaDate(
            new Date(transaction.createdAt),
          );

          let fillColor = '';
          if (hasReason) {
            fillColor = 'FFFFC7CE'; // rojo
          } else if (type === 'Ingreso') {
            fillColor = 'FFC6EFCE'; // verde
          } else {
            fillColor = 'FFFFA500'; // naranja
          }

          // Aplicar color solo a columnas A-D
          headerCols.forEach((col) => {
            const cell = worksheet.getCell(`${col}${currentRow}`);
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: fillColor },
            };
          });

          currentRow++;
        });

        // Stock actual
        const totalStock = product.transactions.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );
        currentRow++;
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        const stockCell = worksheet.getCell(`A${currentRow}`);
        stockCell.value = `Stock Actual: ${totalStock}`;
        stockCell.font = { bold: true };
        stockCell.alignment = { horizontal: 'right' };
        currentRow += 3; // Espacio extra entre productos
      });
    });

    // Ajustar anchos
    worksheet.columns = [
      { width: 20 }, // Tipo
      { width: 25 }, // Motivo
      { width: 12 }, // Cantidad
      { width: 20 }, // Fecha
    ];

    // Configurar respuesta HTTP
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transacciones-stock.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
