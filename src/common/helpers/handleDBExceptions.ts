import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export function handleDBExceptions(error: any) {
  if (error.code === '23505') throw new ConflictException(error.detail); //! email
  if (error.code === '23503') throw new ConflictException(error.detail); //! key not exist

  throw new InternalServerErrorException(error.message);
}
