import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { BrandService } from './brand.service';
import { UpdateBrandLineDto } from './dto/brand.dto';

@Controller('brand')
@UseGuards(JwtAuthGuard)
export class BrandController {
  constructor(private readonly brand: BrandService) {}

  @Get('me')
  getMine(@CurrentUser() user: User) {
    return this.brand.getMine(user);
  }

  @Patch('me')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@CurrentUser() user: User, @Body() dto: UpdateBrandLineDto) {
    return this.brand.update(user, dto);
  }

  @Post('me/logo')
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadLogo(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.brand.uploadLogo(user, file);
  }

  @Get('me/logo/file')
  async logoFile(@CurrentUser() user: User, @Res() res: Response) {
    const file = await this.brand.getLogoFile(user.id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    createReadStream(file.filePath).pipe(res);
  }

  @Post('me/track-view')
  trackView(@CurrentUser() user: User) {
    return this.brand.trackProfileView(user);
  }

  @Post('me/track-qr-scan')
  trackQrScan(@CurrentUser() user: User) {
    return this.brand.trackQrScan(user);
  }
}
