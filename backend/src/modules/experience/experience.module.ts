import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FitProfile,
  DesignProposal,
  ProductInteraction,
} from './experience.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { BrandLineProfile } from '../../database/entities/brand-line-profile.entity';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      FitProfile,
      DesignProposal,
      ProductInteraction,
      CatalogItem,
      BrandLineProfile,
    ]),
  ],
  controllers: [ExperienceController],
  providers: [ExperienceService],
})
export class ExperienceModule {}
