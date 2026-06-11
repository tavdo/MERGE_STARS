import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CatalogService } from './catalog.service';
import {
  CreateCatalogItemDto,
  CreateCollectionDto,
  UpdateCatalogItemDto,
  UpdateCollectionDto,
} from './dto/catalog.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('public')
  listPublic() {
    return this.catalog.listPublic();
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

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard)
  removeItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.catalog.removeItem(user.id, itemId);
  }
}
