import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { GenderType } from '../categories/enums/gender-type.enum';

import { Search } from './entities/search.entity';

@Injectable()
export class SearchsService {
  constructor(
    @InjectRepository(Search)
    private readonly searchRepository: Repository<Search>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(
    { name, gender }: { name: string; gender?: GenderType },
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Search)
      : this.searchRepository;

    try {
      const searchExists = await repo.findOne({ where: { name } });

      if (!searchExists) {
        const newSearch = repo.create({ name, gender });
        return await repo.save(newSearch);
      }

      searchExists.count += 1;
      return await repo.save(searchExists);
    } catch (error) {
      handleDBExceptions(error);
      throw error;
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       FindAll                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async findMostSearched(gender?: GenderType, limit = 10) {
    if (gender) {
      return this.searchRepository.find({
        where: { gender },
        order: { count: 'DESC' },
        take: limit,
      });
    }

    return this.searchRepository.find({
      order: { count: 'DESC' },
      take: limit,
    });
  }
}
