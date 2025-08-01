import { PartialType } from '@nestjs/mapped-types';
import { CreateAddreseDto } from './create-address.dto';

export class UpdateAddreseDto extends PartialType(CreateAddreseDto) {}
