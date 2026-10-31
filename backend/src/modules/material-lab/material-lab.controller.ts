import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsIn, IsObject, IsString, MaxLength } from 'class-validator';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { MaterialLabService } from './material-lab.service';
class CommandDto {
  @IsString() @MaxLength(50) action: string;
  @IsObject() payload: Record<string, unknown>;
}
class UploadDto {
  @IsIn(['certificate', 'photo', 'video', 'manual', 'safety_document'])
  kind: string;
}
@Controller('material-lab')
export class MaterialLabPublicController {
  constructor(private readonly lab: MaterialLabService) {}
  @Get('passports/:batchId') passport(@Param('batchId') id: string) {
    return this.lab.passport(id);
  }
  @Get('products/:productId/sources') sources(@Param('productId') id: string) {
    return this.lab.productSources(id);
  }
}
@Controller('admin/material-lab')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class MaterialLabAdminController {
  constructor(private readonly lab: MaterialLabService) {}
  @Get('batches') list() {
    return this.lab.list();
  }
  @Get('batches/:batchId') read(@Param('batchId') id: string) {
    return this.lab.read(id);
  }
  @Post('batches/:batchId/events') command(
    @Param('batchId') id: string,
    @Body() dto: CommandDto,
    @CurrentUser() user: User,
  ) {
    return this.lab.command(id, dto.action, dto.payload, user.id);
  }
  @Post('batches/:batchId/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024, files: 1 },
    }),
  )
  upload(
    @Param('batchId') id: string,
    @Body() dto: UploadDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.lab.command(
      id,
      'EVIDENCE_UPLOADED',
      {},
      user.id,
      file,
      dto.kind,
    );
  }
  @Get('files/:id') async file(@Param('id') id: string, @Res() res: Response) {
    const f = await this.lab.file(id);
    res.setHeader('Content-Type', f.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${f.name}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(f.bytes);
  }
}
