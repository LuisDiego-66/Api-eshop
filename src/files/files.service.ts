import { BadRequestException, Injectable } from '@nestjs/common';

import { envs } from 'src/config/environments/environments';
import * as path from 'path';
import { existsSync } from 'fs';
import { promises as fs } from 'fs';

@Injectable()
export class FilesService {
  private uploadPath = path.resolve('./static/uploads/');

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Upload                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  getSecureUrl(files: Express.Multer.File[]): string[] {
    const hostApi = envs.HOST;
    return files.map(
      (file) => `${hostApi}/api/multimedia/upload/${file.filename}`,
    );

    /* const hostApi = envs.HOST;
    return files.map((file) => {
      // Detecta la carpeta según el mimetype
      let folder = 'others';
      if (file.mimetype.startsWith('image')) {
        folder = 'images';
      } else if (file.mimetype === 'application/pdf') {
        folder = 'pdfs';
      }

      return `${hostApi}/upload/${folder}/${file.filename}`;
    }); */
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                      GetFile                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  getFile(fileName: string) {
    //const pathFile = path.join(__dirname, '../../static/uploads', fileName);}
    const pathFile = path.resolve('./static/uploads', fileName);
    if (!existsSync(pathFile)) throw new BadRequestException('File not found');
    return pathFile;

    /*     const folders = ['images', 'pdfs', 'others'];
    let pathFile = '';

    for (const folder of folders) {
      const tempPath = path.resolve(`./static/uploads/${folder}`, fileName);
      if (existsSync(tempPath)) {
        pathFile = tempPath;
        break;
      }
    }

    if (!pathFile) throw new BadRequestException('File not found');
    return pathFile; */
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                 deletedFiles                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  async deletedFiles(multimediaFiles: string[] | undefined) {
    if (!multimediaFiles || multimediaFiles.length === 0) return;

    for (const multimediaFile of multimediaFiles) {
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

    /*     if (!multimediaFiles || multimediaFiles.length === 0) return;

    for (const multimediaFile of multimediaFiles) {
      // extrae la carpeta también
      const relativePath = multimediaFile.split('/upload/').pop();
      if (!relativePath) continue;

      const filePath = path.resolve('./static/uploads', relativePath);

      try {
        await fs.access(filePath); // Verifica si existe
        await fs.unlink(filePath); // Lo elimina
      } catch {
        // Si no existe o falla, simplemente se ignora
      }
    } */
  }
}
