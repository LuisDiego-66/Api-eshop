import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateBranchDto, UpdateBranchDto } from './dto';

import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  async create(createBranchDto: CreateBranchDto) {
    try {
      const newBranch = this.branchRepository.create(createBranchDto);
      return await this.branchRepository.save(newBranch);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  async findAll(pagination: PaginationDto) {
    const branches = await this.branchRepository.find();

    return branches;
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  async findOne(id: number) {
    const branch = await this.branchRepository.findOne({
      where: { id },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  async update(id: number, updateBranchDto: UpdateBranchDto) {
    const branch = await this.findOne(id);
    try {
      Object.assign(branch, updateBranchDto);
      return await this.branchRepository.save(branch);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  async remove(id: number) {
    const branch = await this.findOne(id);
    try {
      await this.branchRepository.softRemove(branch);
      return {
        message: 'Branch deleted successfully',
        deleted: branch,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
