import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      this.logger.log('Received create order request');
      this.logger.log(`Request body: ${JSON.stringify(createOrderDto)}`);
      
      const result = await this.ordersService.createOrder(createOrderDto);
      return result;
      
    } catch (error) {
      this.logger.error(`Controller error: ${error.message}`);
      
      if (error.response?.status === 404) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      if (error.status === 404) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    try {
      this.logger.log(`Fetching orders for user: ${userId}`);
      return await this.ordersService.getOrdersByUserId(userId);
    } catch (error) {
      this.logger.error(`Error fetching orders: ${error.message}`);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}