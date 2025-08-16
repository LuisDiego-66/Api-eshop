import { BadRequestException, Injectable } from '@nestjs/common';
//? ---------------------------------------------------------------------------------------------- */
import { envs } from 'src/config/environments/environments';
import * as path from 'path';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';
import { DeleteMultimediaDto } from './dto';

@Injectable()
export class MultimediaService {
  private uploadPath = path.resolve('./static/uploads/');

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Upload                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  getSecureUrl(files: Express.Multer.File[]) {
    const hostApi = envs.HOST;
    const secureUrls = files.map((file) => ({
      //originalName: file.originalname,
      secureUrl: `${hostApi}/api/multimedia/upload/${file.filename}`,
    }));

    return secureUrls;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                      GetFile                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  getFile(fileName: string) {
    //const pathFile = path.join(__dirname, '../../static/uploads', fileName);}
    const pathFile = path.resolve('./static/uploads', fileName);
    if (!existsSync(pathFile)) throw new BadRequestException('File not found');
    return pathFile;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                 deletedFiles                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  async deletedFiles(multimediaFiles: DeleteMultimediaDto) {
    if (!multimediaFiles || multimediaFiles.secureUrl.length === 0) return;

    for (const multimediaFile of multimediaFiles.secureUrl) {
      const fileName = multimediaFile.split('/').pop();
      if (!fileName) continue;

      const filePath = path.join(this.uploadPath, fileName);

      try {
        await fs.access(filePath); // Verifica si existe
        await fs.unlink(filePath); // Lo elimina
      } catch {
        // Si no existe o falla, simplemente se ignora
      }
    }
  }
}
