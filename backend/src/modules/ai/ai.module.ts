import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiTrainingItem } from '../../database/entities/ai-training-item.entity';
import { SettingsModule } from '../settings/settings.module';
import { AiAdminController, AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiTrainingItem]), SettingsModule],
  controllers: [AiController, AiAdminController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
