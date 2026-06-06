import { Controller, Get } from '@nestjs/common';
import { MetalsService } from './metals.service';

@Controller('metals')
export class MetalsController {
  constructor(private readonly metals: MetalsService) {}

  @Get('live')
  live() {
    return this.metals.getLive();
  }
}
