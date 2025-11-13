import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SearchsService } from './searchs.service';

@ApiTags('Searchs')
@Controller('searchs')
export class SearchsController {
  constructor(private readonly searchsService: SearchsService) {}

  @Get()
  findMostSearched() {
    return this.searchsService.findMostSearched();
  }
}
