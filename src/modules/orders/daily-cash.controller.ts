import { Post, Body, Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateDailyCashDto } from './dto';

import { Auth } from 'src/auth/decorators';

import { Roles } from 'src/auth/enums';

import { DailyCashService } from './daily-cash.service';

@ApiTags('Daily Cash')
@Controller('dailyCash')
export class DailyCashController {
  constructor(private readonly sailyCashService: DailyCashService) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post()
  create(@Body() createDailyCashDto: CreateDailyCashDto) {
    return this.sailyCashService.create(createDailyCashDto);
  }

  //? ============================================================================================== */
  //?                                       FindOne                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get()
  findOne() {
    return this.sailyCashService.findOne();
  }
}
