import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of, throwError } from 'rxjs';
import { OrdersService } from '../src/orders/orders.service';
import { OrdersRepository } from '../src/orders/orders.repository';
import { UserClient } from '../src/common/clients/user.client';
import { Order } from '../src/orders/entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: OrdersRepository;
  let userClient: UserClient;

  const mockOrder = {
    id: '1',
    userId: 'user1',
    product: 'Product 1',
    price: 100,
    status: 'pending',
    createdAt: new Date(),
  };

  const mockUser = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
  };

  const mockOrdersRepository = {
    create: jest.fn().mockResolvedValue(mockOrder),
    findByUserId: jest.fn().mockResolvedValue([mockOrder]),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        OrdersRepository,
        UserClient,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<OrdersRepository>(OrdersRepository);
    userClient = module.get<UserClient>(UserClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order when user exists', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockUser }));
      
      const createOrderDto = {
        userId: 'user1',
        product: 'Product 1',
        price: 100,
      };
      
      const result = await service.createOrder(createOrderDto);
      
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith({
        ...createOrderDto,
        status: 'pending',
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith('orders_user_user1');
      expect(result).toEqual(expect.objectContaining({
        userId: 'user1',
        product: 'Product 1',
      }));
    });

    it('should throw error when user does not exist', async () => {
      mockHttpService.get.mockReturnValue(throwError({ response: { status: 404 } }));
      
      const createOrderDto = {
        userId: 'nonexistent',
        product: 'Product 1',
        price: 100,
      };
      
      await expect(service.createOrder(createOrderDto)).rejects.toThrow();
    });
  });

  describe('getOrdersByUserId', () => {
    it('should return orders from cache if available', async () => {
      mockCacheManager.get.mockResolvedValue([mockOrder]);
      
      const result = await service.getOrdersByUserId('user1');
      
      expect(mockCacheManager.get).toHaveBeenCalledWith('orders_user_user1');
      expect(repository.findByUserId).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        userId: 'user1',
        product: 'Product 1',
      }));
    });

    it('should fetch from repository if not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      
      const result = await service.getOrdersByUserId('user1');
      
      expect(mockCacheManager.get).toHaveBeenCalledWith('orders_user_user1');
      expect(repository.findByUserId).toHaveBeenCalledWith('user1');
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        userId: 'user1',
        product: 'Product 1',
      }));
    });
  });
});