import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { BillingService } from './billing.service';
import { BillingDto } from './dto/billing.dto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  //? ============================================================================================== */
  //?                                       Create_Or_Update                                          */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post()
  createOrUpdate(@Body() dto: BillingDto) {
    return this.billingService.createOrUpdate(dto);
  }

  //? ============================================================================================== */
  //?                                       Find_By_Ci                                                */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get(':ci')
  findByCi(@Param('ci') ci: string) {
    return this.billingService.findByCi(ci);
  }
}
