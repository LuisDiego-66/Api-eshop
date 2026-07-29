import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../entities/order.entity';
import { METODO_PAGO_SIAT } from '../constants/metodo-pago-siat.constant';
import { FacturarOrderDto } from './dto/facturar-order.dto';
import { FacturarOrderContingenciaDto } from './dto/facturar-order-contingencia.dto';
import {
  CODIGO_PUNTO_VENTA_DEFAULT,
  USUARIO_FACTURACION_DEFAULT,
} from './constants/factura-catalogo.constant';

import { BranchesService } from 'src/modules/branches/branches.service';

import { FacturacionService } from 'src/siat/facturas/facturacion.service';
import {
  CreateFacturaDto,
  FacturaDetalleDto,
} from 'src/siat/facturas/dto/create-factura.dto';
import { CreateFacturaContingenciaDto } from 'src/siat/facturas/dto/create-factura-contingencia.dto';
import { SettingsDto } from 'src/siat/common/dto/settings.dto';

//* Campos comunes entre FacturarOrderDto y FacturarOrderContingenciaDto
interface FacturarOrderCommonFields {
  branchId: number;
  tipoFacturaDocumento: number;
  codigoDocumentoSector: number;
  codigoMoneda: number;
  tipoCambio: number;
  nombreRazonSocial?: string;
  numeroDocumento?: string;
  complemento?: string;
  codigoTipoDocumentoIdentidad?: number;
}

@Injectable()
export class OrderFacturacionService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly branchesService: BranchesService,
    private readonly facturacionService: FacturacionService,
  ) {}

  async facturarOrder(orderId: number, dto: FacturarOrderDto) {
    const {
      order,
      branch,
      detalles,
      nombreRazonSocial,
      codigoTipoDocumentoIdentidad,
      numeroDocumento,
      complemento,
      codigoCliente,
      codigoMetodoPago,
      nombreSucursal,
      emailsDefault,
    } = await this.buildFacturaData(orderId, dto);

    const createFacturaDto: CreateFacturaDto = {
      razonSocialEmisor: branch.razonSocial,
      municipio: branch.municipio,
      telefono: branch.telefono,
      nombreSucursal,

      tipoFacturaDocumento: dto.tipoFacturaDocumento,
      codigoDocumentoSector: dto.codigoDocumentoSector,
      codigoMoneda: dto.codigoMoneda,
      tipoCambio: dto.tipoCambio,

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad,
      numeroDocumento,
      complemento,
      codigoCliente,
      codigoMetodoPago,

      numeroTarjeta: dto.numeroTarjeta,
      montoGiftCard: dto.montoGiftCard,
      descuentoAdicional: dto.descuentoAdicional,
      usuario: dto.usuario ?? USUARIO_FACTURACION_DEFAULT,
      emails: dto.emails ?? emailsDefault,

      detalles,
    };

    const settings: SettingsDto = {
      codigoSucursal: branch.codigoSucursal,
      codigoPuntoVenta: CODIGO_PUNTO_VENTA_DEFAULT,
    };

    return this.facturacionService.facturacionOnline(
      createFacturaDto,
      settings,
      order,
    );
  }

  async facturarOrderContingencia(
    orderId: number,
    dto: FacturarOrderContingenciaDto,
  ) {
    const {
      order,
      branch,
      detalles,
      nombreRazonSocial,
      codigoTipoDocumentoIdentidad,
      numeroDocumento,
      complemento,
      codigoCliente,
      codigoMetodoPago,
      nombreSucursal,
      emailsDefault,
    } = await this.buildFacturaData(orderId, dto);

    const createFacturaContingenciaDto: CreateFacturaContingenciaDto = {
      razonSocialEmisor: branch.razonSocial,
      municipio: branch.municipio,
      telefono: branch.telefono,
      nombreSucursal,

      eventoSignificativoId: dto.eventoSignificativoId,
      fechaEmision: dto.fechaEmision,
      cafc: dto.cafc,

      tipoFacturaDocumento: dto.tipoFacturaDocumento,
      codigoDocumentoSector: dto.codigoDocumentoSector,
      codigoMoneda: dto.codigoMoneda,
      tipoCambio: dto.tipoCambio,

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad,
      numeroDocumento,
      complemento,
      codigoCliente,
      codigoMetodoPago,

      numeroTarjeta: dto.numeroTarjeta,
      montoGiftCard: dto.montoGiftCard,
      descuentoAdicional: dto.descuentoAdicional,
      usuario: dto.usuario ?? USUARIO_FACTURACION_DEFAULT,
      emails: dto.emails ?? emailsDefault,

      detalles,
    };

    const settings: SettingsDto = {
      codigoSucursal: branch.codigoSucursal,
      codigoPuntoVenta: CODIGO_PUNTO_VENTA_DEFAULT,
    };

    return this.facturacionService.facturacionOfflineContingencia(
      createFacturaContingenciaDto,
      settings,
      order,
    );
  }

  //? ============================================================================================== */
  //?                       Datos comunes a online y contingencia                                     */
  //? ============================================================================================== */

  private async buildFacturaData(
    orderId: number,
    dto: FacturarOrderCommonFields,
  ) {
    // --------------------------------------------------
    // 1. Cargar la order con todo lo necesario
    // --------------------------------------------------

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        billing: true,
        factura: true,
        items: { variant: { productColor: { product: true } } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.factura) {
      throw new BadRequestException(
        `La order ${orderId} ya tiene una factura generada (id ${order.factura.id})`,
      );
    }

    if (!order.billing) {
      throw new BadRequestException(
        `La order ${orderId} no tiene datos de facturación (billing)`,
      );
    }

    if (!order.items?.length) {
      throw new BadRequestException(`La order ${orderId} no tiene items`);
    }

    //! order.shipment_price no se factura (se ignora por ahora): el montoTotal
    //! de la factura sale solo de los items, no de order.totalPrice.

    // --------------------------------------------------
    // 2. Resolver sucursal
    // --------------------------------------------------

    const branch = await this.branchesService.findOne(dto.branchId);

    // --------------------------------------------------
    // 3. Construir detalles a partir de los items
    // --------------------------------------------------

    const detalles: FacturaDetalleDto[] = order.items.map((item) => {
      const product = item.variant?.productColor?.product;

      if (!product) {
        throw new BadRequestException(
          `El item ${item.id} de la order ${orderId} no tiene producto asociado`,
        );
      }

      if (!product.codigoProductoSin || !product.unidadMedida) {
        throw new BadRequestException(
          `El producto "${product.name}" (id ${product.id}) no tiene codigoProductoSin/unidadMedida configurado. No se puede facturar.`,
        );
      }

      return {
        actividadEconomica: branch.actividadEconomica,
        codigoProductoSin: product.codigoProductoSin,
        codigoProducto: `PROD-${product.id}`,
        descripcion: product.name,
        cantidad: item.quantity,
        unidadMedida: product.unidadMedida,
        precioUnitario: Number(item.unit_price),
        montoDescuento: item.discountValue || undefined,
      };
    });

    // --------------------------------------------------
    // 4. Datos del cliente: override del dto o fallback a order.billing
    //    (nunca se modifica el billing guardado)
    // --------------------------------------------------

    const nombreRazonSocial = dto.nombreRazonSocial ?? order.billing.name;
    const numeroDocumento = dto.numeroDocumento ?? order.billing.ci;
    const complemento = dto.complemento ?? order.billing.complemento;
    const codigoTipoDocumentoIdentidad =
      dto.codigoTipoDocumentoIdentidad ??
      order.billing.codigoTipoDocumentoIdentidad;

    if (
      !nombreRazonSocial ||
      !numeroDocumento ||
      !codigoTipoDocumentoIdentidad
    ) {
      throw new BadRequestException(
        `Faltan datos del cliente para facturar la order ${orderId} (nombre/razón social, número de documento o tipo de documento). Complétalos en el billing o en el DTO.`,
      );
    }

    return {
      order,
      branch,
      detalles,
      nombreRazonSocial,
      numeroDocumento,
      complemento,
      codigoTipoDocumentoIdentidad,
      codigoCliente: `CLI-${order.billing.id}`,
      codigoMetodoPago: METODO_PAGO_SIAT[order.payment_type],
      nombreSucursal: `${branch.name} ${branch.codigoSucursal}`,
      emailsDefault:
        order.billing.email || order.email
          ? [order.billing.email || order.email!]
          : undefined,
    };
  }
}
