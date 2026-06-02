import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { BillingDto } from './dto/billing.dto';

import { Billing } from './entities/billing.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
  ) {}

  async createOrUpdate(
    dto: BillingDto | null | undefined,
    manager?: EntityManager,
  ) {
    if (!dto) return null;

    const repo = manager
      ? manager.getRepository(Billing)
      : this.billingRepository;

    const { ci, ...rest } = dto;

    try {
      // 1. Buscar por CI (único)
      const billingExists = await repo.findOne({
        where: { ci },
      });

      // 2. Si NO existe → crear
      if (!billingExists) {
        const newBilling = repo.create(dto);
        return await repo.save(newBilling);
      }

      // 3. Si existe → actualizar solo los campos enviados
      const updated = repo.merge(billingExists, rest);

      return await repo.save(updated);
    } catch (error) {
      handleDBExceptions(error);
      throw error;
    }
  }
}
