import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

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

  async create(name: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Search)
      : this.searchRepository;

    try {
      const searchExists = await repo.findOne({ where: { name } });

      if (!searchExists) {
        const newSearch = repo.create({ name });
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

  async findMostSearched(limit = 10) {
    return this.searchRepository.find({
      order: { count: 'DESC' },
      take: limit,
    });
  }
}
