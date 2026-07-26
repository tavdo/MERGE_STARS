import { Body, Controller, Get, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { OrdersService } from './orders.service';

class CreateOrderDto {
  @IsString()
  applicationId: string;

  @IsOptional()
  @IsIn(['full', 'bank', 'earnings'])
  paymentMethod?: string;
}

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

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.orders.createForApplication(
      user,
      dto.applicationId,
      dto.paymentMethod ?? 'bank',
    );
  }

  @Post(':id/pay-earnings')
  @UseGuards(JwtAuthGuard)
  payWithEarnings(@CurrentUser() user: User, @Param('id') id: string) {
    return this.orders.payWithEarnings(user, id);
  }
}
