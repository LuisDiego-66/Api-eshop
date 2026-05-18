import {
  Min,
  IsInt,
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsPositive,
  ValidateIf,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFacturaContingenciaDto {
  //* ============================================================================================== */
  //* Información del Emisor

  @ApiProperty({
    description: 'Razón social del emisor',
    example: 'EMPRESA DEMO S.R.L.',
  })
  @IsString()
  @IsNotEmpty()
  razonSocialEmisor: string;

  @ApiProperty({
    description: 'Municipio donde se emite la factura',
    example: 'La Paz',
  })
  @IsString()
  @IsNotEmpty()
  municipio: string;

  @ApiProperty({
    description: 'Teléfono del emisor',
    example: '77777777',
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
    example: '4111111111111111',
  })
  @ValidateIf((o) => o.codigoMetodoPago === 10)
  @IsNotEmpty({
    message: 'numeroTarjeta es obligatorio cuando es pago con tarjeta',
  })
  @Matches(/^\d{1,16}$/, {
    message: 'numeroTarjeta debe tener 1-16 dígitos numéricos',
  })
  @IsString()
  numeroTarjeta?: string | null;

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

  //* ============================================================================================== */
  //* Descuentos y adicionales

  @ApiPropertyOptional({
    description: 'Monto de gift card',
    example: 10,
  })
  @ValidateIf((o) => o.codigoMetodoPago === 27)
  @IsNotEmpty({ message: 'montoGiftCard es obligatorio cuando es Gift Card' })
  @IsNumber()
  @Min(0)
  montoGiftCard?: number | null;

  @ApiPropertyOptional({
    description: 'Descuento adicional',
    example: 5,
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

  @ApiPropertyOptional({
    description: 'CAFC (solo emisión fuera de línea)',
    example: '101A194B4341C',
  })
  @IsString()
  cafc: string;

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
    example: 10,
  })
  @IsNumber()
  @IsPositive()
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
    example: 2.5,
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
}
