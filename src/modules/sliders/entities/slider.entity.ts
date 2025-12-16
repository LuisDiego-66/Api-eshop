import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GenderType } from 'src/modules/categories/enums/gender-type.enum';
import { SliderType } from '../enums/slider-type.enum';

@Entity('sliders')
export class Slider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  image: string;

  @Column('text')
  button_text: string;

  @Column('text')
  url: string;

  @Column({ type: 'enum', enum: SliderType })
  slider_type: SliderType;

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;
}
