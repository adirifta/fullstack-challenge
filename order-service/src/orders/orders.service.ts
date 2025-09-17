import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { OrdersRepository } from './orders.repository';
import { UserClient } from '../common/clients/user.client';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly userClient: UserClient,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      this.logger.log(`Creating order for user: ${createOrderDto.userId}`);
      
      this.logger.log('Verifying user existence...');
      await this.userClient.getUserById(createOrderDto.userId);
      this.logger.log('User verified successfully');

      this.logger.log('Creating order in database...');
      const order = await this.ordersRepository.create({
        ...createOrderDto,
        status: 'pending',
      });

      this.logger.log('Invalidating cache...');
      await this.cacheManager.del(`orders_user_${createOrderDto.userId}`);

      this.logger.log('Order created successfully');
      return new OrderResponseDto(order);
      
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  async getOrdersByUserId(userId: string): Promise<OrderResponseDto[]> {
    try {
      this.logger.log(`Getting orders for user: ${userId}`);

      const cacheKey = `orders_user_${userId}`;
      const cachedOrders = await this.cacheManager.get(cacheKey);
      if (cachedOrders) {
        this.logger.log('Returning orders from cache');
        return (cachedOrders as any[]).map(order => new OrderResponseDto(order));
      }

      this.logger.log('Fetching orders from database');
      const orders = await this.ordersRepository.findByUserId(userId);

      await this.cacheManager.set(cacheKey, orders, 300000);
      
      this.logger.log('Returning orders from database');
      return orders.map(order => new OrderResponseDto(order));
      
    } catch (error) {
      this.logger.error(`Error getting orders: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
}