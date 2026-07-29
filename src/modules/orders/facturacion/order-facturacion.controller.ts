import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { OrderFacturacionService } from './order-facturacion.service';
import { FacturarOrderDto } from './dto/facturar-order.dto';
import { FacturarOrderContingenciaDto } from './dto/facturar-order-contingencia.dto';

@ApiTags('Orders - Facturación')
@Controller('orders')
export class OrderFacturacionController {
  constructor(
    private readonly orderFacturacionService: OrderFacturacionService,
  ) {}

  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post(':orderId/facturar')
  facturar(
    @Param('orderId', ParseIntPipe) id: number,
    @Body() dto: FacturarOrderDto,
  ) {
    return this.orderFacturacionService.facturarOrder(id, dto);
  }

  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post(':orderId/facturar-contingencia')
  facturarContingencia(
    @Param('orderId', ParseIntPipe) id: number,
    @Body() dto: FacturarOrderContingenciaDto,
  ) {
    return this.orderFacturacionService.facturarOrderContingencia(id, dto);
  }
}
