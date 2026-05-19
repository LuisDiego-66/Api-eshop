import {
  IsString,
  IsNumber,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsPositive,
  Min,
  IsInt,
  Matches,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFacturaDto {
  //* ============================================================================================== */
  //* Información del Emisor

  @ApiProperty({
    description: 'Razón social del emisor',
    example: 'EMPRESA TOAS S.R.L.',
  })
  @IsString()
  @IsNotEmpty()
  razonSocialEmisor: string;

  @ApiProperty({
    description: 'Municipio donde se emite la factura',
    example: 'Santa Cruz de la Sierra',
  })
  @IsString()
  @IsNotEmpty()
  municipio: string;

  @ApiProperty({
    description: 'Teléfono del emisor',
    example: '78407993',
  })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  //* ============================================================================================== */
  //* Información de la Factura

  @ApiProperty({
    description: 'Tipo de documento sector (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  tipoDocumentoSector: number;

  @ApiProperty({
    description: 'Tipo de emisión (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  tipoEmision: number;

  @ApiProperty({
    description: 'Tipo de factura (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  tipoFactura: number;

  @ApiProperty({
    description: 'Tipo factura Documento(catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  tipoFacturaDocumento: number;

  //* ============================================================================================== */
  //* Información del Cliente

  @ApiProperty({
    description: 'Nombre o razón social del cliente',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  nombreRazonSocial: string;

  @ApiProperty({
    description: 'Tipo de documento de identidad (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  codigoTipoDocumentoIdentidad: number;

  @ApiProperty({
    description: 'Número de documento del cliente',
    example: '12345678',
  })
  //@IsNumberString({}, { message: 'El número de documento debe ser numérico' })
  @IsString()
  @IsNotEmpty()
  numeroDocumento: string;

  @ApiPropertyOptional({
    description: 'Complemento del documento',
    example: 'LP',
  })
  @IsOptional()
  @IsString()
  complemento?: string | null;

  @ApiProperty({
    description: 'Código interno del cliente',
    example: 'CLI-001',
  })
  @IsString()
  @IsNotEmpty()
  codigoCliente: string;

  @ApiProperty({
    description: 'Método de pago (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  codigoMetodoPago: number;

  @ApiPropertyOptional({
    description: 'Número de tarjeta (si aplica)',
    type: 'string',
    example: '4111111111111111',
  })
  @IsOptional()
  @Matches(/^\d{1,16}$/, {
    message: 'numeroTarjeta debe tener 1-16 dígitos numéricos',
  })
  @IsString()
  numeroTarjeta?: string | null;

  //* ============================================================================================== */
  //* Montos

  /* @ApiProperty({
    description: 'Monto total de la factura',
    example: 25,
  })
  @IsNumber()
  @IsPositive()
  montoTotal: number; */

  /* @ApiProperty({
    description: 'Monto sujeto a IVA',
    example: 25,
  })
  @IsNumber()
  @Min(0)
  montoTotalSujetoIva: number; */

  //* ============================================================================================== */
  //* Moneda

  @ApiProperty({
    description: 'Código de moneda (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  codigoMoneda: number;

  @ApiProperty({
    description: 'Tipo de cambio',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  tipoCambio: number;

  /* @ApiProperty({
    description: 'Monto total en la moneda seleccionada',
    example: 25,
  })
  @IsNumber()
  @IsPositive()
  montoTotalMoneda: number; */

  //* ============================================================================================== */
  //* Descuentos y adicionales

  /* @ApiPropertyOptional({
    description: 'Monto de gift card',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoGiftCard?: number | null; */

  @ApiPropertyOptional({
    description: 'Monto de gift card',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoGiftCard?: number | null;

  @ApiPropertyOptional({
    description: 'Descuento adicional',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoAdicional?: number | null;

  @ApiPropertyOptional({
    description: 'Código de excepción',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsInt()
  codigoExcepcion?: number | null;

  @ApiProperty({
    description: 'Usuario que emite la factura',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({
    description: 'Código documento sector',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  codigoDocumentoSector: number;

  //* ============================================================================================== */
  //* Detalles

  @ApiProperty({
    description: 'Detalle de la factura',
    type: () => FacturaDetalleDto,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'La factura debe tener al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => FacturaDetalleDto)
  detalles: FacturaDetalleDto[];
}

//* ============================================================================================== */

export class FacturaDetalleDto {
  @ApiProperty({
    description: 'Actividad económica (catálogo SIAT)',
    example: '477110',
  })
  @IsString()
  @IsNotEmpty()
  actividadEconomica: string;

  @ApiProperty({
    description: 'Código producto SIN',
    example: 62233,
  })
  @IsNumber()
  @IsPositive()
  codigoProductoSin: number;

  @ApiProperty({
    description: 'Código interno del producto',
    example: 'PROD-001',
  })
  @IsString()
  @IsNotEmpty()
  codigoProducto: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'polera',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Cantidad',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  @ApiProperty({
    description: 'Unidad de medida (catálogo SIAT)',
    example: 62,
  })
  @IsNumber()
  @IsInt()
  unidadMedida: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  precioUnitario: number;

  @ApiPropertyOptional({
    description: 'Monto descuento',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoDescuento?: number | null;

  /* @ApiProperty({
    description: 'Subtotal',
    example: 25,
  })
  @IsNumber()
  @Min(0)
  subTotal: number; */

  /* @ApiPropertyOptional({
    description: 'Número de serie',
    example: 'SN-123456',
  })
  @IsOptional()
  @IsString()
  numeroSerie?: string | null;

  @ApiPropertyOptional({
    description: 'Número IMEI',
    example: '356938035643809',
  })
  @IsOptional()
  @IsString()
  numeroImei?: string | null; */
}
