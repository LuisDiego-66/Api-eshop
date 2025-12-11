import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { GenerateQRDto } from './dto/generate-qr.dto';

import { BNBPayload } from './interfaces/bnb-payload.interface';

import { OrderStatus, PaymentType } from '../orders/enums';

import { HttpService } from './http/http.service';
import { OrdersService } from '../orders/orders.service';

import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private httpService: HttpService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private ordersService: OrdersService,
  ) {}

  //? ============================================================================================== */
  //?                                   Generate QR                                                  */
  //? ============================================================================================== */

  async generateQr(generateQrDto: GenerateQRDto) {
    const { orderId } = generateQrDto;

    // --------------------------------------------
    // 1. Orden PENDING, tipo QR, no expirada
    // --------------------------------------------

    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        status: OrderStatus.PENDING,
        payment_type: PaymentType.QR,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order ${orderId} not found, not pending or not type QR`,
      );
    }

    // --------------------------------------------
    // 2. Generar QR
    // --------------------------------------------

    const { message: token } = await this.authentication();
    return await this.httpService
      .GenerateQr(token, {
        amount: 0.1, //Number(order.totalPrice),
        gloss: 'Order ' + order.id,
        additionalData: order.id.toString(),
      })
      .then((res) => res.data)
      .catch((err) => {
        const axiosResp = err.response;
        return {
          status: axiosResp?.status,
          data: axiosResp?.data,
          message: axiosResp?.data?.message || 'Error in BCP QR API',
        };
      });
  }

  //? ============================================================================================== */
  //?                                 Confirm_Order                                                  */
  //? ============================================================================================== */

  async confirmOrder(body: BNBPayload) {
    await this.ordersService.confirmOrderQr(body);
  }

  //? ============================================================================================== */
  //?                                     QR_Status                                                  */
  //? ============================================================================================== */

  async qrStatus(idQr: string) {
    const { message: token } = await this.authentication();
    return await this.httpService
      .QrStatus(token, idQr)
      .then((res) => res.data)
      .catch((err) => {
        const axiosResp = err.response;
        return {
          status: axiosResp?.status,
          data: axiosResp?.data,
          message: axiosResp?.data?.message || 'Error in BCP QR API',
        };
      });
  }

  //? ============================================================================================== */
  //?                                Authentication                                                  */
  //? ============================================================================================== */

  async authentication() {
    return await this.httpService
      .Authentication()
      .then((res) => res.data)
      .catch((err) => {
        const axiosResp = err.response;
        return {
          status: axiosResp?.status,
          data: axiosResp?.data,
          message: axiosResp?.data?.message || 'Error in BCP QR API',
        };
      });
  }
}
