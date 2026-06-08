import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referrals: ReferralsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.referrals.listForReferrer(user.id);
  }

  @Get('stats')
  stats(@CurrentUser() user: User) {
    return this.referrals.statsForReferrer(user.id, user.mergeId);
  }
}
