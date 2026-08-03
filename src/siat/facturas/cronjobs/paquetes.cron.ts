import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PaquetesService } from '../paquetes.service';

@Injectable()
export class PaquetesCronJob {
  private readonly logger = new Logger(PaquetesCronJob.name);
  private isRunning = false;

  constructor(private readonly paquetesService: PaquetesService) {}

  @Cron('0 0,12 * * *') // 12 am y 12 pm
  async handleRecepcionPaquetes() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      await this.paquetesService.recepcionPaqueteFactura();
    } catch (error) {
      this.logger.error('Error al enviar paquetes de facturas', error);
    } finally {
      this.isRunning = false;
    }
  }
}
