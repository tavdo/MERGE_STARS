import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CatalogService } from './catalog.service';
import { MeshyService } from './meshy.service';
import {
  AddBrandRoomPickDto,
  CreateCatalogItemDto,
  CreateCollectionDto,
  CreateMasterProductDto,
  MeshyGenerateDto,
  MoveCatalogItemDto,
  UpdateCatalogItemDto,
  UpdateCollectionDto,
  UpdateMasterProductDto,
} from './dto/catalog.dto';

const uploadRoot = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');
const modelTmpDir = join(uploadRoot, 'tmp');
mkdirSync(modelTmpDir, { recursive: true });

const modelUpload = FileInterceptor('file', {
  storage: diskStorage({
    destination: (_req, _file, cb) => cb(null, modelTmpDir),
    filename: (_req, file, cb) => {
      const ext = file.originalname.split('.').pop()?.toLowerCase() || 'glb';
      cb(null, `upload-${randomUUID()}.${ext}`);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 1024 },
});

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly meshy: MeshyService,
  ) {}

  @Get('master/houses')
  masterHouses() {
    return this.catalog.listMasterNav();
  }

  @Get('master/products')
  @UseGuards(JwtAuthGuard)
  listMasterProducts(
    @CurrentUser() user: User,
    @Query('q') q?: string,
    @Query('house') house?: string,
    @Query('cluster') cluster?: string,
    @Query('collectionId') collectionId?: string,
  ) {
    return this.catalog.listMasterProducts({
      q,
      house,
      cluster,
      collectionId,
      userId: user.id,
    });
  }

  @Get('brand-room/catalog')
  @UseGuards(JwtAuthGuard)
  brandRoomCatalog(@CurrentUser() user: User) {
    return this.catalog.listBrandRoomCatalog(user.id);
  }

  @Post('brand-room/picks')
  @UseGuards(JwtAuthGuard)
  addBrandRoomPick(@CurrentUser() user: User, @Body() dto: AddBrandRoomPickDto) {
    return this.catalog.addBrandRoomPick(user.id, dto.catalogItemId);
  }

  @Delete('brand-room/picks/:itemId')
  @UseGuards(JwtAuthGuard)
  removeBrandRoomPick(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.catalog.removeBrandRoomPick(user.id, itemId);
  }

  @Get('master/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  adminMasterList() {
    return this.catalog.listAdminMasterProducts();
  }

  @Post('master/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  adminMasterCreate(@CurrentUser() user: User, @Body() dto: CreateMasterProductDto) {
    return this.catalog.createMasterProduct(user.id, dto);
  }

  @Patch('master/admin/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  adminMasterUpdate(@Param('itemId') itemId: string, @Body() dto: UpdateMasterProductDto) {
    return this.catalog.updateMasterProduct(itemId, dto);
  }

  @Post('master/admin/:itemId/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  adminMasterImage(@Param('itemId') itemId: string, @UploadedFile() file: Express.Multer.File) {
    return this.catalog.uploadMasterImage(itemId, file);
  }

  @Post('master/admin/:itemId/model3d')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @UseInterceptors(modelUpload)
  adminMasterModel(@Param('itemId') itemId: string, @UploadedFile() file: Express.Multer.File) {
    return this.catalog.uploadMasterModel3d(itemId, file);
  }

  @Get('public')
  listPublic(@Query('category') category?: string) {
    return this.catalog.listPublic(50, category);
  }

  @Get('public/categories')
  categoryStats() {
    return this.catalog.publicCategoryStats();
  }

  @Get('public/items/:itemId/image')
  async publicImage(@Param('itemId') itemId: string, @Res() res: Response) {
    const file = await this.catalog.getPublicImageFile(itemId);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    createReadStream(file.filePath).pipe(res);
  }

  @Get('public/items/:itemId/model3d')
  async publicModel(@Param('itemId') itemId: string, @Res() res: Response) {
    const file = await this.catalog.getPublicModelFile(itemId);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    createReadStream(file.filePath).pipe(res);
  }

  @Get('public/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.catalog.getPublicBySlug(slug);
  }

  @Get('collections')
  @UseGuards(JwtAuthGuard)
  listMine(@CurrentUser() user: User) {
    return this.catalog.listForUser(user.id);
  }

  @Post('collections')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@CurrentUser() user: User, @Body() dto: CreateCollectionDto) {
    return this.catalog.create(user.id, dto);
  }

  @Get('collections/:id')
  @UseGuards(JwtAuthGuard)
  getOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.catalog.getForUser(user.id, id);
  }

  @Patch('collections/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.catalog.update(user.id, id, dto);
  }

  @Delete('collections/:id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.catalog.remove(user.id, id);
  }

  @Post('collections/:id/items')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  addItem(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateCatalogItemDto,
  ) {
    return this.catalog.addItem(user.id, id, dto);
  }

  @Patch('items/:itemId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  updateItem(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    return this.catalog.updateItem(user.id, itemId, dto);
  }

  @Post('items/:itemId/move')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  moveItem(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: MoveCatalogItemDto,
  ) {
    return this.catalog.moveItem(user.id, itemId, dto);
  }

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard)
  removeItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.catalog.removeItem(user.id, itemId);
  }

  @Post('items/:itemId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  uploadImage(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.catalog.uploadImage(user.id, itemId, file);
  }

  @Post('items/:itemId/model3d')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(modelUpload)
  uploadModel(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.catalog.uploadModel3d(user.id, itemId, file);
  }

  @Get('items/:itemId/image/file')
  @UseGuards(JwtAuthGuard)
  async imageFile(@CurrentUser() user: User, @Param('itemId') itemId: string, @Res() res: Response) {
    const file = await this.catalog.getImageFileForUser(user.id, itemId);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    createReadStream(file.filePath).pipe(res);
  }

  @Get('items/:itemId/model3d/file')
  @UseGuards(JwtAuthGuard)
  async modelFile(@CurrentUser() user: User, @Param('itemId') itemId: string, @Res() res: Response) {
    const file = await this.catalog.getModelFileForUser(user.id, itemId);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    createReadStream(file.filePath).pipe(res);
  }

  @Post('meshy/generate')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  meshyGenerate(@CurrentUser() user: User, @Body() dto: MeshyGenerateDto) {
    return this.meshy.startGenerate(user.id, dto.prompt, dto.style ?? '');
  }

  @Post('meshy/generate-from-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 4, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  meshyGenerateFromImage(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('style') style?: string,
    @Body('prompt') prompt?: string,
  ) {
    return this.meshy.startGenerateFromImages(
      user.id,
      files ?? [],
      style ?? '',
      prompt ?? '',
    );
  }

  @Get('meshy/jobs/:jobId')
  @UseGuards(JwtAuthGuard)
  meshyJob(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.meshy.getJob(user.id, jobId);
  }

  @Get('meshy/files/:fileName')
  meshyFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const file = this.meshy.getStoredFile(fileName);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    file.stream.pipe(res);
  }
}
