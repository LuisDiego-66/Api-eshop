import { Body, Get, Post, Param, Patch, Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { CafcService } from './cafc.service';
import { CreateCafcDto } from './dto/create-cafc.dto';
import { UpdateCafcDto } from './dto/update-cafc.dto';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@Controller('cafc')
export class CafcController {
  constructor(private readonly cafcService: CafcService) {}

  @Post()
  create(@Body() dto: CreateCafcDto) {
    return this.cafcService.create(dto);
  }

  @Get()
  findAll() {
    return this.cafcService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cafcService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCafcDto) {
    return this.cafcService.update(+id, dto);
  }
}
