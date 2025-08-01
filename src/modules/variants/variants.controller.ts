import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  create(@Body() createProductVariantDto: CreateVariantDto) {
    return this.variantsService.create(createProductVariantDto);
  }

  @Get()
  findAll() {
    return this.variantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variantsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateVariantDto,
  ) {
    return this.variantsService.update(+id, updateProductVariantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantsService.remove(+id);
  }
}
