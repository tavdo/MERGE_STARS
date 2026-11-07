import { ConflictException, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: User) {
    return this.orders.listForUser(user.id);
  }

  @Get('delivery/latest')
  @UseGuards(JwtAuthGuard)
  latestDelivery(@CurrentUser() user: User) {
    return this.orders.getLatestDelivery(user.id);
  }

  @Get('awaiting-earnings')
  @UseGuards(JwtAuthGuard)
  awaitingEarnings(@CurrentUser() user: User) {
    return this.orders.listAwaitingEarnings(user.id);
  }

  @Post(['', ':id/pay-earnings'])
  @UseGuards(JwtAuthGuard)
  unavailablePayment() {
    throw new ConflictException('A verified offer is required before payment.');
  }
}
