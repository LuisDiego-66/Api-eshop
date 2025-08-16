import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/roles.enum';

export const META_ROLES = 'roles'; // nombre de la metadata

export const Rol = (...rol: Roles[]) => {
  return SetMetadata(META_ROLES, rol);
};
