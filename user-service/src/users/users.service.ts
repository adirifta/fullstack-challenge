import { Injectable, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserCreatedEvent } from './events/user-created.event';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, 
    @Inject('RABBITMQ_CLIENT') private rabbitmqClient: ClientProxy,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.create(createUserDto);
    
    this.rabbitmqClient.emit('user.created', new UserCreatedEvent(
      user.id,
      user.name,
      user.email,
      user.createdAt,
    ));

    return new UserResponseDto(user);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const cachedUser = await this.cacheManager.get<User>(`user_${id}`);
    if (cachedUser) {
      return new UserResponseDto(cachedUser);
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.cacheManager.set(`user_${id}`, user, 300000);

    return new UserResponseDto(user);
  }
}