import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { KycService } from './kyc.service';

@Controller()
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Post('users/me/kyc/documents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.kyc.uploadForUser(user.id, file);
  }

  @Get('users/me/kyc/documents')
  @UseGuards(JwtAuthGuard)
  myDocuments(@CurrentUser() user: User) {
    return this.kyc.listForUser(user.id);
  }

  @Get('users/me/kyc/documents/:id/file')
  @UseGuards(JwtAuthGuard)
  async downloadMine(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const doc = await this.kyc.getFileForUser(user.id, id);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(doc.originalName)}"`,
    );
    createReadStream(doc.filePath).pipe(res);
  }

  @Get('admin/users/:userId/kyc/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  adminList(@Param('userId') userId: string) {
    return this.kyc.listForAdmin(userId);
  }

  @Get('admin/kyc/documents/:id/file')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async adminDownload(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.kyc.getFileForAdmin(id);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(doc.originalName)}"`,
    );
    createReadStream(doc.filePath).pipe(res);
  }
}
