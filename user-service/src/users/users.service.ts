// user-service/src/users/users.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager'; // Gunakan import type
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // Import CACHE_MANAGER yang benar
import { ClientProxy } from '@nestjs/microservices';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserCreatedEvent } from './events/user-created.event';
import { User } from './entities/user.entity'; // Import User entity

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Gunakan CACHE_MANAGER
    @Inject('RABBITMQ_CLIENT') private rabbitmqClient: ClientProxy,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.create(createUserDto);
    
    // Emit user created event
    this.rabbitmqClient.emit('user.created', new UserCreatedEvent(
      user.id,
      user.name,
      user.email,
      user.createdAt,
    ));

    return new UserResponseDto(user);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    // Try to get from cache first
    const cachedUser = await this.cacheManager.get<User>(`user_${id}`);
    if (cachedUser) {
      return new UserResponseDto(cachedUser);
    }

    // If not in cache, get from database
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Store in cache for future requests (TTL: 5 minutes)
    await this.cacheManager.set(`user_${id}`, user, 300000);

    return new UserResponseDto(user);
  }
}