import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserClient {
  private readonly logger = new Logger(UserClient.name);

  constructor(private httpService: HttpService) {}

  async getUserById(userId: string): Promise<any> {
    try {
      this.logger.log(`Fetching user with ID: ${userId}`);
      
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      this.logger.log(`User service URL: ${userServiceUrl}`);
      
      const response = await firstValueFrom(
        this.httpService
          .get(`${userServiceUrl}/users/${userId}`)
          .pipe(
            map(response => response.data),
            catchError(error => {
              this.logger.error(`Error fetching user: ${error.message}`);
              if (error.response?.status === 404) {
                throw new HttpException('User not found', 404);
              }
              throw new HttpException('Error communicating with user service', 500);
            }),
          )
      );

      this.logger.log('User found successfully');
      return response;
      
    } catch (error) {
      this.logger.error(`User client error: ${error.message}`);
      throw error;
    }
  }
}