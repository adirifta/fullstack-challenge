import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { UsersService } from '../src/users/users.service';
import { UsersRepository } from '../src/users/users.repository';
import { User } from '../src/users/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
  };

  const mockUsersRepository = {
    create: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: 'RABBITMQ_CLIENT',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and emit an event', async () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' };
      const result = await service.createUser(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockClientProxy.emit).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
      }));
    });
  });

  describe('getUserById', () => {
    it('should return a user from cache if available', async () => {
      mockCacheManager.get.mockResolvedValue(mockUser);
      
      const result = await service.getUserById('1');
      
      expect(mockCacheManager.get).toHaveBeenCalledWith('user_1');
      expect(repository.findById).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: '1',
        name: 'John Doe',
      }));
    });

    it('should fetch from repository if not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      
      const result = await service.getUserById('1');
      
      expect(mockCacheManager.get).toHaveBeenCalledWith('user_1');
      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: '1',
        name: 'John Doe',
      }));
    });
  });
});