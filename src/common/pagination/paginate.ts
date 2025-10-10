/* import { Repository, ObjectLiteral, Like } from 'typeorm';
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
} */

/* import {
  Repository,
  ObjectLiteral,
  Like,
  ILike,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { PaginationDto } from './pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: FindManyOptions<T> = {},
  paginationDto: PaginationDto,
  searchableFields: (keyof T)[] = [],
  caseInsensitive = true,
) {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;
  const skip = (page - 1) * limit;
  const { search } = paginationDto;

  if (search && searchableFields.length > 0) {
    //! Construimos el array de condiciones de búsqueda
    const searchWhere: FindOptionsWhere<T>[] = searchableFields.map(
      (field) => ({
        [field]: caseInsensitive ? ILike(`%${search}%`) : Like(`%${search}%`),
      }),
    ) as FindOptionsWhere<T>[]; //! Cast para que TypeScript acepte el tipo

    //! Combinamos con cualquier where existente
    const existingWhere = options.where;
    if (existingWhere) {
      options.where = Array.isArray(existingWhere)
        ? [...existingWhere, ...searchWhere]
        : [existingWhere, ...searchWhere];
    } else {
      options.where = searchWhere;
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
} */

import {
  Repository,
  ObjectLiteral,
  Like,
  ILike,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { PaginationDto } from './pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: FindManyOptions<T> = {},
  paginationDto: PaginationDto,
  searchableFields: (keyof T)[] = [],
  caseInsensitive = true,
) {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;
  const skip = (page - 1) * limit;
  const { search } = paginationDto;

  // Si hay texto de búsqueda y campos buscables definidos
  if (search && searchableFields.length > 0) {
    // Construimos condiciones individuales por campo (ej: name, email)
    const searchWhere: FindOptionsWhere<T>[] = searchableFields.map(
      (field) => ({
        [field]: caseInsensitive ? ILike(`%${search}%`) : Like(`%${search}%`),
      }),
    ) as FindOptionsWhere<T>[];

    const existingWhere = options.where;

    if (existingWhere) {
      // Convertimos cualquier where existente a array para combinarlo fácilmente
      const baseWhereArray = Array.isArray(existingWhere)
        ? existingWhere
        : [existingWhere];

      //Combina cada where base con cada condición de búsqueda (AND)
      options.where = baseWhereArray.flatMap((base) =>
        searchWhere.map((searchCond) => ({
          ...base,
          ...searchCond,
        })),
      );
    } else {
      // Si no había where previo, usamos solo las condiciones de búsqueda
      options.where = searchWhere;
    }
  }

  // se ejecuta la consulta paginada
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
