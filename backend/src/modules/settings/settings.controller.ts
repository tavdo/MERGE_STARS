import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PlatformSettingsService } from './platform-settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly platform: PlatformSettingsService) {}

  @Get('public')
  getPublic() {
    return this.platform.getPublic();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  get() {
    return this.platform.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  update(
    @Body()
    body: {
      tickerEnabled?: boolean;
      aiEnabled?: boolean;
      autoVerify?: boolean;
      platformShare?: string;
      brandShare?: string;
      referrerShare?: string;
    },
  ) {
    return this.platform.update(body);
  }
}
