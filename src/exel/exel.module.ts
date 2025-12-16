import { Module } from '@nestjs/common';
import { ExelService } from './exel.service';

@Module({
  providers: [ExelService],
  exports: [ExelService],
})
export class ExelModule {}
