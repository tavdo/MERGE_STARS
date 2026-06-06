import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { OrdersService } from './orders.service';

class CreateOrderDto {
  @IsString()
  applicationId: string;

  @IsOptional()
  @IsIn(['full', 'bank'])
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
}
