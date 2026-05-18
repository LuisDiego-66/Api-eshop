import { PartialType } from '@nestjs/mapped-types';
import { CreateCafcDto } from './create-cafc.dto';

export class UpdateCafcDto extends PartialType(CreateCafcDto) {}
