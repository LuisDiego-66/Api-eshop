import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Discount } from '../discounts/entities/discount.entity';
import { Variant } from '../variants/entities/variant.entity';
import { Order, Item } from './entities';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, OrderType } from './enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const itemsArray: Item[] = [];
      let totalPriceOrder = 0;

      for (const item of createOrderDto.items) {
        //! se obtiene  la variante con un bloqueo pesimista
        const variantEntity = await queryRunner.manager
          .createQueryBuilder(Variant, 'variant')
          .innerJoin('variant.product', 'product')
          .leftJoin('product.discount', 'discount')
          .addSelect([
            'variant.id',
            'variant.name',
            'product.price',
            'discount',
          ])
          .where('variant.id = :id', { id: item.variant })
          .setLock('pessimistic_write', undefined, ['variant']) //! bloqueo pesimista de escritura
          .getOne();

        //! se valida si la variante existe
        if (!variantEntity) {
          throw new NotFoundException(`Variant ${item.variant} not found`);
        }

        //! se valida si hay stock suficiente en la variante
        if (
          variantEntity.stock < item.quantity ||
          variantEntity.available == false
        ) {
          throw new BadRequestException(
            `Insufficient stock in variant ${variantEntity.id}`,
          );
        }

        //! calcular el subtotal del pedido con el descuento aplicado
        const totalPriceItem = this.calculateSubtotalItem(
          {
            quantity: item.quantity,
            unit_price: variantEntity.product.price,
            discountValue: variantEntity.product.discount?.value || 0,
          } as Item,
          variantEntity.product.discount as Discount,
        );

        //! crear el item y asignar los valores necesarios
        const newItem = queryRunner.manager.create(Item, {
          quantity: item.quantity,
          unit_price: variantEntity.product.price,
          discountValue: variantEntity.product.discount?.value || 0,
          totalPrice: totalPriceItem,
          variant: variantEntity,
        });

        //! agregamos el item al array de items
        itemsArray.push(newItem);

        //! Reducir stock
        variantEntity.stock -= item.quantity;
        await queryRunner.manager.save(variantEntity);

        //! sumar el total del precio del item al total de la orden
        totalPriceOrder += Number(totalPriceItem);
      }

      //! Crear y guardar la orden

      const newOrder = queryRunner.manager.create(Order, {
        ...createOrderDto,

        //! si es orden en tienda se pone como finalizada
        status:
          createOrderDto.type === OrderType.IN_STORE
            ? OrderStatus.FINISHED
            : OrderStatus.IN_PROGRESS,

        totalPrice: totalPriceOrder.toFixed(2), //! se asigna el total de la orden
        items: itemsArray,
        customer: createOrderDto.customer
          ? { id: createOrderDto.customer }
          : undefined,
        shipment: createOrderDto.shipment
          ? { id: createOrderDto.shipment }
          : undefined,
        address: createOrderDto.address
          ? { id: createOrderDto.address }
          : undefined,
      });

      await queryRunner.manager.save(newOrder);
      await queryRunner.commitTransaction();

      return newOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */

  calculateSubtotalItem(item: Item, discount: Discount) {
    const subtotal = item.quantity * Number(item.unit_price);
    let totalPrice = '';

    if (item.discountValue != 0) {
      const discount = (subtotal * item.discountValue) / 100;
      totalPrice = (subtotal - discount).toFixed(2);
    } else {
      totalPrice = subtotal.toFixed(2);
    }
    return totalPrice;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const orders = await this.orderRepository.find({
      take: limit,
      skip: offset,
      relations: {
        items: { variant: { product: true } },
        customer: true,
        shipment: true,
        address: true,
      },
    });

    return orders;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        items: { variant: { product: true } },
        customer: true,
        shipment: true,
        address: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code === '23503') throw new ConflictException(error.detail); //! key not exist

    throw new InternalServerErrorException(error.message);
  }
}
