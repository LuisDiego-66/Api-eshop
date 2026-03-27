import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SoapClient } from './soap/soap.client';

import { CodigosController } from './codigos/codigos.controller';
import { CodigosService } from './codigos/codigos.service';
import { RequestsCodigosService } from './codigos/services/request-codigos.service';
import { Cuis } from './codigos/entities/cuis.entity';
import { Cufd } from './codigos/entities/cufd.entity';

import { CatalogosController } from './catalogos/catalogos.controller';
import { ListasService } from './catalogos/Listas.service';
import { FechaHoraService } from './catalogos/fecha-hora.service';
import { ParametricasService } from './catalogos/parametricas.service';
import { SincronizacionService } from './catalogos/services/sincronizacion.service';
import { SiatLista } from './catalogos/entities/lista.entity';
import { SiatSync } from './catalogos/entities/siat_sync.entity';
import { SiatParametrica } from './catalogos/entities/parametrica.entity';

import { FacturacionController } from './facturas/facturacion.controller';
import { PaquetesService } from './facturas/paquetes.service';
import { FacturacionService } from './facturas/facturacion.service';
import { FacturaBuilderService } from './facturas/services/factura-builder.service';
import { EventosSignificativosService } from './operaciones/eventos-significativos.service';
import { RequestsFacturacionService } from './facturas/services/requests-facturacion.service';
import { Factura } from './facturas/entities/factura.entity';
import { Detalle } from './facturas/entities/detalle.entity';
import { Paquete } from './facturas/entities/paquete.entity';

import { OperacionesController } from './operaciones/operaciones.controller';
import { PuntosVentaService } from './operaciones/puntos-venta.service';
import { RequestsOperacionesService } from './operaciones/services/requests-operaciones.service';
import { PuntoVenta } from './operaciones/entities/punto-venta.entity';
import { EventoSignificativo } from './operaciones/entities/evento-significativo.entity';
import { RequestsCatalogosService } from './catalogos/services/request-catalogos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cuis,
      Cufd,

      SiatSync,
      SiatLista,
      SiatParametrica,

      Paquete,
      Factura,
      Detalle,

      EventoSignificativo,
      PuntoVenta,
    ]),
  ],
  controllers: [
    CodigosController,
    CatalogosController,
    FacturacionController,
    OperacionesController,
  ],
  providers: [
    SoapClient,

    RequestsCodigosService,
    CodigosService,
    FechaHoraService,

    SincronizacionService,
    RequestsCatalogosService,
    ListasService,
    ParametricasService,

    FacturaBuilderService,

    RequestsFacturacionService,
    FacturacionService,
    PaquetesService,

    RequestsOperacionesService,
    EventosSignificativosService,
    PuntosVentaService,
  ],
})
export class SiatModule {}
