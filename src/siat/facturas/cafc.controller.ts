import { Body, Get, Post, Param, Patch, Controller } from '@nestjs/common';
import { CafcService } from './cafc.service';
import { CreateCafcDto } from './dto/create-cafc.dto';
import { UpdateCafcDto } from './dto/update-cafc.dto';

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
