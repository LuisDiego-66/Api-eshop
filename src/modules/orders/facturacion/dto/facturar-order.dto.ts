import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  Equals,
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class FacturarOrderDto {
  @ApiProperty({
    description: 'Id de la sucursal (Branch) desde la que se factura',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  branchId: number;

  //* ============================================================================================== */
  //* Catálogo SIAT: los da el frontend (sacados de los catálogos sincronizados)

  @ApiProperty({
    description: 'Tipo factura Documento (catálogo SIAT)',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  tipoFacturaDocumento: number;

  @ApiProperty({
    description: 'Código documento sector (debe ser 1 para compra-venta)',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @Equals(1)
  codigoDocumentoSector: number;

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
  //* Overrides puntuales del cliente (si no se mandan, se usa order.billing sin modificarlo)

  @ApiPropertyOptional({
    description:
      'Nombre o razón social del cliente para esta factura (por defecto: order.billing.name)',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombreRazonSocial?: string;

  @ApiPropertyOptional({
    description:
      'Número de documento del cliente para esta factura (por defecto: order.billing.ci)',
    example: '12345678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroDocumento?: string;

  @ApiPropertyOptional({
    description:
      'Complemento del documento (por defecto: order.billing.complemento)',
    example: 'LP',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  complemento?: string;

  @ApiPropertyOptional({
    description:
      'Tipo de documento de identidad, catálogo SIAT (por defecto: order.billing.codigoTipoDocumentoIdentidad)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  codigoTipoDocumentoIdentidad?: number;

  //* ============================================================================================== */

  @ApiPropertyOptional({
    description:
      'Usuario que emite la factura (por defecto: "ecommerce")',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  usuario?: string;

  @ApiPropertyOptional({
    description:
      'Correos para envío automático (por defecto: el email de la order/billing, si existe)',
    example: ['cliente@example.com'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  emails?: string[];

  @ApiPropertyOptional({
    description: 'Número de tarjeta (si aplica)',
    example: '4111111111111111',
  })
  @IsOptional()
  @Matches(/^\d{1,16}$/, {
    message: 'numeroTarjeta debe tener 1-16 dígitos numéricos',
  })
  @IsString()
  numeroTarjeta?: string;

  @ApiPropertyOptional({
    description: 'Monto de gift card',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoGiftCard?: number;

  @ApiPropertyOptional({
    description: 'Descuento adicional',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoAdicional?: number;
}
