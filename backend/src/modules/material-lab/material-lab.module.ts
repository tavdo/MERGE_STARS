import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialLabEvent, MaterialLabFile } from './material-lab.entity';
import { MaterialLabService } from './material-lab.service';
import {
  MaterialLabAdminController,
  MaterialLabPublicController,
} from './material-lab.controller';
@Module({
  imports: [TypeOrmModule.forFeature([MaterialLabEvent, MaterialLabFile])],
  controllers: [MaterialLabAdminController, MaterialLabPublicController],
  providers: [MaterialLabService],
})
export class MaterialLabModule {}
