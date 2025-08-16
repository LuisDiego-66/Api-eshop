import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Customer } from 'src/modules/customers/entities/customer.entity';
//? ---------------------------------------------------------------------------------------------- */
import { LoginUserDto } from './dto';
import { IJwtPayload, IGooglePayload } from './interfaces';
import { LoginType } from 'src/common/enums/login-type.enum';
import { CreateCustomerDto } from 'src/modules/customers/dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                               SignInCustomer                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  async signIn(GooglePayload: IGooglePayload) {
    if (!GooglePayload) {
      throw new BadRequestException('Unauthenticated');
    }

    const customerEntity = await this.findCustomerByEmail(GooglePayload.email);

    if (!customerEntity) {
      return await this.register(GooglePayload);
    }

    return {
      token: this.generateJwt({
        id: customerEntity.id,
        email: customerEntity.email,
        type: LoginType.customer,
      }),
    };
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                RegisterCustomer                                                */
  //? ---------------------------------------------------------------------------------------------- */

  async register(createCustomerDto: CreateCustomerDto) {
    try {
      const newCustomer = this.customerRepository.create(createCustomerDto);
      const customer = await this.customerRepository.save(newCustomer);

      return {
        token: this.generateJwt({
          id: customer.id,
          email: customer.email,
          type: LoginType.customer,
        }),
      };
    } catch (error) {
      console.log(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                    LoginUser                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  login(loginUserDto: LoginUserDto) {}

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  async findCustomerByEmail(email: string) {
    const customer = await this.customerRepository.findOneBy({ email });
    if (!customer) {
      return null;
    }
    return customer;
  }

  generateJwt(JwtPayload: IJwtPayload) {
    return this.jwtService.sign(JwtPayload);
  }
}
