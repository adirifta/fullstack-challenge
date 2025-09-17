import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { UserClient } from '../common/clients/user.client';
import { UserCreatedListener } from './listeners/user-created.listener';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    HttpModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, UserClient, UserCreatedListener],
})
export class OrdersModule {}