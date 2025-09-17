export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.createdAt = user.createdAt;
  }
}