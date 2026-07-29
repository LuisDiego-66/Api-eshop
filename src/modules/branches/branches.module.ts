import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [TypeOrmModule, BranchesService],
})
export class BranchesModule {}
