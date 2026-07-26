import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../../database/entities/user.entity';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('status')
  status() {
    return this.ai.status();
  }

  @Post('chat')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard)
  chat(
    @CurrentUser() user: User,
    @Body()
    body: {
      message?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    },
  ) {
    return this.ai.chat(body.message ?? '', body.history ?? [], user.id);
  }
}

@Controller('admin/ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class AiAdminController {
  constructor(private readonly ai: AiService) {}

  @Get('pending')
  listPending() {
    return this.ai.listPending();
  }

  @Get('knowledge')
  listKnowledge() {
    return this.ai.listTrained();
  }

  @Post('pending/:id/teach')
  teach(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { answer?: string },
  ) {
    return this.ai.teach(id, body.answer ?? '', user.id);
  }

  @Post('pending/:id/dismiss')
  dismiss(@Param('id') id: string) {
    return this.ai.dismiss(id);
  }

  @Post('knowledge')
  createKnowledge(
    @CurrentUser() user: User,
    @Body() body: { question?: string; answer?: string },
  ) {
    return this.ai.createKnowledge(body.question ?? '', body.answer ?? '', user.id);
  }

  @Patch('knowledge/:id')
  updateKnowledge(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { question?: string; answer?: string },
  ) {
    return this.ai.updateKnowledge(id, body, user.id);
  }

  @Delete('knowledge/:id')
  removeKnowledge(@Param('id') id: string) {
    return this.ai.removeKnowledge(id);
  }
}
