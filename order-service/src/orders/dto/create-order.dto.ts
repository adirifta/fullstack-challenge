import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  product: string;

  @IsNumber()
  @IsPositive()
  price: number;
}