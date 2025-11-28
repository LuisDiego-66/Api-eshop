import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/pagination/pagination.dto';

import { GenderType } from '../categories/enums/gender-type.enum';

import { ProductsService } from './products.service';
import { SearchsService } from './searchs.service';

@ApiTags('Searchs')
@Controller('searchs')
export class SearchsController {
  constructor(
    private readonly searchsService: SearchsService,

    private readonly productsService: ProductsService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                FindAll_advance                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get('advanced')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllForCategoriesAndSubCategories(@Query() pagination: PaginationDto) {
    return this.productsService.findAllForCategoriesAndSubCategories(
      pagination,
    );
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                FindAll_Searchs                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @ApiQuery({
    name: 'type',
    required: false,
    enum: GenderType,
  })
  @Get()
  findMostSearched(@Query('type') gender: GenderType) {
    return this.searchsService.findMostSearched(gender);
  }
}
