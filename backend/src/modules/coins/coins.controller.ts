import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CoinsService } from './coins.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';

@Controller('coins')
export class CoinsController {
  constructor(private readonly coins: CoinsService) {}

  @Get('applications')
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: User) {
    const items = await this.coins.listForUser(user.id);
    return items;
  }

  @Get('applications/latest')
  @UseGuards(JwtAuthGuard)
  async latest(@CurrentUser() user: User) {
    return this.coins.getLatestForUser(user.id);
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard)
  async get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coins.getForUser(user.id, id);
  }

  @Post('applications')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async submit(@CurrentUser() user: User, @Body() dto: SubmitApplicationDto) {
    return this.coins.submit(user, dto);
  }
}
