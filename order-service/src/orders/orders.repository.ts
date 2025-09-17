import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.repository.create(orderData);
    return await this.repository.save(order);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return await this.repository.find({ where: { userId } });
  }
}