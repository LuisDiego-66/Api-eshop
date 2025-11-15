import { Repository, ObjectLiteral } from 'typeorm';
import { PaginationDto } from './pagination.dto';

export async function paginateAdvanced<T extends ObjectLiteral>(
  repository: Repository<T>,
  paginationDto: PaginationDto,
  searchableFields: string[] = [],
  relations: string[] = [],
  order: Record<string, 'ASC' | 'DESC'> = { id: 'ASC' },
  caseInsensitive = true,
) {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;
  const skip = (page - 1) * limit;
  const { search } = paginationDto;

  const qb = repository.createQueryBuilder('entity');
  const joinedAliases = new Map<string, string>(); // relación -> alias real
  joinedAliases.set('entity', 'entity'); // base

  //! 🔹 Crear JOINs anidados con alias únicos
  for (const relation of relations) {
    const parts = relation.split('.');
    let parentAlias = 'entity';
    let fullPath = '';

    for (const part of parts) {
      fullPath = fullPath ? `${fullPath}.${part}` : part;

      // generar alias único si no existe
      if (!joinedAliases.has(fullPath)) {
        const alias = part; // alias lógico
        qb.leftJoinAndSelect(`${parentAlias}.${part}`, alias);
        joinedAliases.set(fullPath, alias);
      }

      parentAlias = joinedAliases.get(fullPath)!;
    }
  }

  //! 🔹 Búsqueda
  if (search && searchableFields.length > 0) {
    const conditions = searchableFields.map((field) => {
      const parts = field.split('.');
      let alias = 'entity';
      let column = '';

      // recorrer la jerarquía de campos para usar alias correctos
      for (let i = 0; i < parts.length - 1; i++) {
        const path = parts.slice(0, i + 1).join('.');
        alias = joinedAliases.get(path) || alias;
      }
      column = `${alias}.${parts[parts.length - 1]}`;

      // compatibilidad PostgreSQL / MySQL
      return caseInsensitive
        ? `LOWER(${column}) LIKE LOWER(:search)`
        : `${column} LIKE :search`;
    });

    qb.andWhere(`(${conditions.join(' OR ')})`, { search: `%${search}%` });
  }

  //! 🔹 Ordenamiento
  Object.entries(order).forEach(([field, direction]) => {
    const parts = field.split('.');
    let alias = 'entity';
    for (let i = 0; i < parts.length - 1; i++) {
      const path = parts.slice(0, i + 1).join('.');
      alias = joinedAliases.get(path) || alias;
    }
    const column = `${alias}.${parts[parts.length - 1]}`;
    qb.addOrderBy(column, direction);
  });

  qb.skip(skip).take(limit);

  const [data, total] = await qb.getManyAndCount();
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
