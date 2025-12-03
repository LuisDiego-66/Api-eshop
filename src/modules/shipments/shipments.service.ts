import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateShipmentDto, UpdateShipmentDto } from './dto';

import { Shipment } from './entities/shipment.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createShipmentDto: CreateShipmentDto) {
    const newShipment = this.shipmentRepository.create({
      ...createShipmentDto,
    });
    return await this.shipmentRepository.save(newShipment);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll() {
    const shipments = await this.shipmentRepository.find({});
    return shipments;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async updateNational(id: number, updateShipmentDto: UpdateShipmentDto) {
    const shipment = await this.findOne(id);
    try {
      Object.assign(shipment, updateShipmentDto);
      return await this.shipmentRepository.save(shipment);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const shipment = await this.findOne(id);
    try {
      await this.shipmentRepository.softRemove(shipment);
      return {
        message: 'Shipment deleted successfully',
        deleted: shipment,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
