import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BannerType } from '../enums/banner-type.enum';
import { GenderType } from 'src/modules/categories/enums/gender-type.enum';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  type: BannerType;

  @Column('text')
  gender: GenderType;

  @Column('text')
  video: string;
}
