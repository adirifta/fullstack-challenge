import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('Starting application...');
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`User service is running on port ${port}`);
  } catch (error) {
    console.error('Error starting application:', error);
  }
}
bootstrap();