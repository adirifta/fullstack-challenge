import { Injectable, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  @EventPattern('user.created')
  async handleUserCreatedEvent(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`Received user.created event: ${JSON.stringify(payload)}`);
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
    } catch (error) {
      this.logger.error(`Error processing user.created event: ${error.message}`);
      
      // Negative acknowledge the message (will be requeued)
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg);
    }
  }
}