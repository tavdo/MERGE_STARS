import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformSettings } from '../../database/entities/platform-settings.entity';
import { PlatformSettingsService } from './platform-settings.service';
import { SettingsController } from './settings.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettings])],
  controllers: [SettingsController],
  providers: [PlatformSettingsService],
  exports: [PlatformSettingsService],
})
export class SettingsModule {}
