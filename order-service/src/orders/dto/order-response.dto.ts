export class OrderResponseDto {
  id: string;
  userId: string;
  product: string;
  price: number;
  status: string;
  createdAt: Date;

  constructor(order: any) {
    this.id = order.id;
    this.userId = order.userId;
    this.product = order.product;
    this.price = order.price;
    this.status = order.status;
    this.createdAt = order.createdAt;
  }
}