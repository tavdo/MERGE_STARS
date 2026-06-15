import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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
  chat(@Body() body: { message?: string; history?: { role: 'user' | 'assistant'; content: string }[] }) {
    return this.ai.chat(body.message ?? '', body.history ?? []);
  }
}
