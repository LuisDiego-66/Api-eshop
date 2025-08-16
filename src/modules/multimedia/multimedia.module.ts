import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { MultimediaController } from './multimedia.controller';
import { MultimediaService } from './multimedia.service';
import { Multimedia } from './entities/multimedia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Multimedia])],
  controllers: [MultimediaController],
  providers: [MultimediaService],
  exports: [TypeOrmModule, MultimediaService],
})
export class MultimediaModule {}
