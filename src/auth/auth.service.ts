import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateCustomerDto } from 'src/modules/customers/dto';
import { CreateSubscriberDto, LoginUserDto } from './dto';

import { IJwtPayload, IGooglePayload } from './interfaces';

import { LoginType } from 'src/common/enums/login-type.enum';
import { CustomerType } from 'src/modules/customers/enums/customer-type.enum';

import { UsersService } from 'src/modules/users/users.service';

import { Customer } from 'src/modules/customers/entities/customer.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  //? ============================================================================================== */
  //?                               SignInCustomer                                                   */
  //? ============================================================================================== */

  async signIn(GooglePayload: IGooglePayload) {
    if (!GooglePayload) {
      throw new BadRequestException('Unauthenticated');
    }

    const customerEntity = await this.findCustomerByEmail(GooglePayload.email);

    if (!customerEntity) {
      return await this.registerCustomer(GooglePayload);
    } else if (customerEntity.type === CustomerType.SUBSCRIBED) {
      return await this.registerCustomerSubscribe(GooglePayload);
    }

    return {
      email: customerEntity.email,
      token: this.generateJwt({
        id: customerEntity.id,
        email: customerEntity.email,
        type: LoginType.customer,
      }),
    };
  }

  //? ============================================================================================== */
  //?                      CreateCustomerSubscribe                                                   */
  //? ============================================================================================== */

  async createCustomerSubscribe(createSubscriberDto: CreateSubscriberDto) {
    const customer = await this.findCustomerByEmail(createSubscriberDto.email);

    if (customer) {
      throw new ConflictException(
        'The email is already registered or subscribed',
      );
    }

    const newSubscriber = this.customerRepository.create({
      ...createSubscriberDto,
      type: CustomerType.SUBSCRIBED,
    });

    return await this.customerRepository.save(newSubscriber);
  }

  //? ============================================================================================== */
  //?                                RegisterCustomer                                                */
  //? ============================================================================================== */

  async registerCustomer(createCustomerDto: CreateCustomerDto) {
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
  //? ============================================================================================== */
  //?                       RegisterCustomerSubscribe                                                */
  //? ============================================================================================== */

  async registerCustomerSubscribe(createCustomerDto: CreateCustomerDto) {
    try {
      const customerEntity = await this.findCustomerByEmail(
        createCustomerDto.email,
      );

      if (!customerEntity) {
        throw new NotFoundException('Subscriber not found');
      }

      Object.assign(customerEntity, {
        ...createCustomerDto,
        type: CustomerType.REGISTERED,
      });

      const customer = await this.customerRepository.save(customerEntity);

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

  //? ============================================================================================== */
  //?                                    LoginUser                                                   */
  //? ============================================================================================== */

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...entityWithoutPassword } = user;

    return {
      token: this.generateJwt({
        id: entityWithoutPassword.id,
        email: entityWithoutPassword.email,
        type: LoginType.user,
      }),
    };
  }

  //* ============================================================================================== */
  //*                                        Functions                                               */
  //* ============================================================================================== */

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
