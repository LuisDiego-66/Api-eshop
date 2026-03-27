import { Controller } from '@nestjs/common';
import { SiatService } from './siat.service';

@Controller('siat')
export class SiatController {
  constructor(private readonly siatService: SiatService) {}
}
