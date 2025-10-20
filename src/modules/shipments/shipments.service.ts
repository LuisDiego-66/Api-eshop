import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  CreateNationalShipmentDto,
  CreateInternationalShipmentDto,
  UpdateNationalShipmentDto,
  UpdateInternationalShipmentDto,
} from './dto';

import { ShipmentMethod } from './enums/shipment-method.enum';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Shipment } from './entities/shipment.entity';
import { NationalShipment } from './entities/national-shipment.entity';
import { InternationalShipment } from './entities/international-shipment.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,

    @InjectRepository(NationalShipment)
    private readonly nationalRepository: Repository<NationalShipment>,

    @InjectRepository(InternationalShipment)
    private readonly internationalRepository: Repository<InternationalShipment>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  // National
  async createNational(createShipmentDto: CreateNationalShipmentDto) {
    const newShipment = this.nationalRepository.create({
      ...createShipmentDto,
      method: ShipmentMethod.NATIONAL, //! se asigna el método de envío ( nacional )
    });
    return await this.nationalRepository.save(newShipment);
  }

  // International
  async createInternational(createShipmentDto: CreateInternationalShipmentDto) {
    const newShipment = this.internationalRepository.create({
      ...createShipmentDto,
      method: ShipmentMethod.INTERNATIONAL, //! se asigna el método de envío ( internacional )
    });
    return await this.internationalRepository.save(newShipment);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  // All
  async findAll(pagination: PaginationDto) {
    const shipments = await this.shipmentRepository.find({});
    return shipments;
  }

  // National
  async findAllNational(pagination: PaginationDto) {
    const shipments = await this.nationalRepository.find({});
    return shipments;
  }

  // International
  async findAllInterNational(pagination: PaginationDto) {
    const shipments = await this.internationalRepository.find({});
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

  // National
  async updateNational(
    id: number,
    updateShipmentDto: UpdateNationalShipmentDto,
  ) {
    const shipment = await this.findOne(id);
    try {
      Object.assign(shipment, updateShipmentDto);
      return await this.nationalRepository.save(shipment);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  // International
  async updateInternational(
    id: number,
    updateShipmentDto: UpdateInternationalShipmentDto,
  ) {
    const shipment = await this.findOne(id);
    try {
      Object.assign(shipment, updateShipmentDto);
      return await this.internationalRepository.save(shipment);
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
