import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Res,
  Delete,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
//? ---------------------------------------------------------------------------------------------- */
//? ---------------------------------------------------------------------------------------------- */
import { DeleteMultimediaDto } from './dto';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';
import { MultimediaService } from './multimedia.service';

@Controller('multimedia')
export class MultimediaController {
  constructor(private readonly multimediaService: MultimediaService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Upload                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/uploads',
        filename: fileNamer,
      }),
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Make sure that at least one file was uploaded',
      );
    }
    return this.multimediaService.getSecureUrl(files);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                      GetFiles                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Get('/upload/:file')
  getFile(@Res() res: Response, @Param('file') file: string) {
    const path = this.multimediaService.getFile(file);
    res.sendFile(path);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                  deletedFiles                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Delete()
  deleteFiles(@Body() deleteDto: DeleteMultimediaDto) {
    return this.multimediaService.deletedFiles(deleteDto);
  }
}
