import {
  Min,
  Max,
  MaxLength,
  IsInt,
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
  Matches,
  Equals,
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
  @MaxLength(200)
  razonSocialEmisor: string;

  @ApiProperty({
    description: 'Municipio donde se emite la factura',
    example: 'Santa Cruz de la Sierra',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  municipio: string;

  @ApiProperty({
    description: 'Teléfono del emisor',
    example: '78407993',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
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
  @MaxLength(500)
  nombreRazonSocial: string;

  @ApiProperty({
    description: 'Tipo de documento de identidad (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(5)
  codigoTipoDocumentoIdentidad: number;

  @ApiProperty({
    description: 'Número de documento del cliente',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numeroDocumento: string;

  @ApiPropertyOptional({
    description: 'Complemento del documento',
    example: '9K',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  complemento?: string | null;

  @ApiProperty({
    description: 'Código interno del cliente',
    example: 'CLI-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigoCliente: string;

  @ApiProperty({
    description: 'Método de pago (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(308)
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
  //* Moneda

  @ApiProperty({
    description: 'Código de moneda (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(154)
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
  @IsOptional()
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
  @Min(0)
  @Max(1)
  codigoExcepcion?: number | null;

  @ApiPropertyOptional({
    description: 'CAFC (solo emisión fuera de línea)',
    example: '101A194B4341C',
  })
  @IsString()
  @MaxLength(50)
  cafc: string;

  @ApiProperty({
    description: 'Usuario que emite la factura',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  usuario: string;

  @ApiProperty({
    description: 'Código documento sector (debe ser 1 para compra-venta)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @Equals(1)
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
  @MaxLength(10)
  actividadEconomica: string;

  @ApiProperty({
    description: 'Código producto SIN',
    example: 62233,
  })
  @IsNumber()
  @IsPositive()
  @Max(99999999)
  codigoProductoSin: number;

  @ApiProperty({
    description: 'Código interno del producto',
    example: 'PROD-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigoProducto: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'polera',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion: string;

  @ApiProperty({
    description: 'Cantidad',
    example: 10,
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
  @Min(1)
  @Max(200)
  unidadMedida: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 2.5,
  })
  @IsNumber()
  @Min(0)
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
