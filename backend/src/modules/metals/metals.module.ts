import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetalPrice } from '../../database/entities/metal-price.entity';
import { MetalsController } from './metals.controller';
import { MetalsGateway } from './metals.gateway';
import { MetalsService } from './metals.service';

@Module({
  imports: [TypeOrmModule.forFeature([MetalPrice])],
  controllers: [MetalsController],
  providers: [MetalsService, MetalsGateway],
  exports: [MetalsService],
})
export class MetalsModule {}
