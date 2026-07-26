import { Body, Controller, Get, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { WalletService } from './wallet.service';

class AdminCreditDto {
  /** email, mergeId, or user uuid */
  @IsString()
  identifier: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}

@Controller()
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('wallet/me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User, @Query('limit') limit?: string) {
    return this.wallet.getMe(user.id, limit ? Number(limit) : 30);
  }

  @Post('wallet/activate')
  @UseGuards(JwtAuthGuard)
  activate(@CurrentUser() user: User) {
    return this.wallet.activate(user.id, 'user');
  }

  @Post('admin/wallet/credit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  adminCredit(@CurrentUser() admin: User, @Body() dto: AdminCreditDto) {
    return this.wallet.creditByEmailOrMergeId({
      identifier: dto.identifier,
      amount: dto.amount,
      note: dto.note,
      createdBy: admin.id,
    });
  }
}
