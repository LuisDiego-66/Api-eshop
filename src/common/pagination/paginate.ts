/* import { Repository, FindManyOptions, ObjectLiteral } from 'typeorm';
import { PaginationDto } from './pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: FindManyOptions<T>,
  paginationDto: PaginationDto,
) {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;

  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  const lastPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      lastPage,
      limit,
      offset: skip,
      hasNextPage: page < lastPage,
      hasPreviousPage: page > 1,
    },
  };
} */

/* import { Repository, FindManyOptions, ObjectLiteral, Like } from 'typeorm';
import { PaginationDto } from './pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: FindManyOptions<T>,
  paginationDto: PaginationDto,
  searchableFields: (keyof T)[] = [],
) {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;
  const skip = (page - 1) * limit;
  const { search } = paginationDto;

  if (search && searchableFields.length > 0) {
    options.where = searchableFields.map((field) => ({
      ...((options.where as ObjectLiteral) || {}),
      [field]: Like(`%${search}%`),
    })) as any;
  }

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  const lastPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      lastPage,
      limit,
      offset: skip,
      hasNextPage: page < lastPage,
      hasPreviousPage: page > 1,
    },
  };
}
 */

import { Repository, ObjectLiteral, Like } from 'typeorm';
import { PaginationDto } from './pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: any,
  paginationDto: PaginationDto,
  searchableFields: (keyof T)[] = [],
  caseInsensitive = true,
) {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;
  const skip = (page - 1) * limit;
  const { search } = paginationDto;

  if (search && searchableFields.length > 0) {
    if (caseInsensitive) {
      // Para PostgreSQL
      const { ILike } = require('typeorm');
      options.where = searchableFields.map((field) => ({
        ...((options.where as ObjectLiteral) || {}),
        [field]: ILike(`%${search}%`),
      }));
    } else {
      // Case-sensitive
      options.where = searchableFields.map((field) => ({
        ...((options.where as ObjectLiteral) || {}),
        [field]: Like(`%${search}%`),
      }));
    }
  }

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  const lastPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      lastPage,
      limit,
      offset: skip,
      hasNextPage: page < lastPage,
      hasPreviousPage: page > 1,
    },
  };
}
