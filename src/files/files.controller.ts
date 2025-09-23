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
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';

import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('multimedia')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
    FilesInterceptor('files', 10, {
      fileFilter: fileFilter,
      /* storage: diskStorage({
        destination: (req, file, cb) => {
          let uploadPath = './static/uploads/others';

          if (file.mimetype.startsWith('image')) {
            uploadPath = './static/uploads/images';
          } else if (file.mimetype === 'application/pdf') {
            uploadPath = './static/uploads/pdfs';
          }

          cb(null, uploadPath);
        },
        filename: fileNamer,
      }), */
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
    return this.filesService.getSecureUrl(files);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                      GetFiles                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Get('/upload/:file')
  getFile(@Res() res: Response, @Param('file') file: string) {
    const path = this.filesService.getFile(file);
    res.sendFile(path);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                  deletedFiles                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Delete()
  deleteFiles(@Body() deleteDto: string[]) {
    return this.filesService.deletedFiles(deleteDto);
  }
}
