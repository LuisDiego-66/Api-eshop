import { LoginType } from '../../common/enums/login-type.enum';

export interface IJwtPayload {
  id: number;
  email: string;
  type: LoginType;
}
