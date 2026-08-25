import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CoinConfiguratorService } from './coin-configurator.service';
import {
  AddConfiguratorProductDto,
  ApproveConfiguratorProductDto,
  CreateConfiguratorSessionDto,
  UpdateConfiguratorProductDto,
  UpdatePackageConfigDto,
} from './dto/configurator.dto';

@Controller('coin-configurator')
export class CoinConfiguratorController {
  constructor(private readonly configurator: CoinConfiguratorService) {}

  @Get('product-types')
  productTypes() {
    return this.configurator.listProductTypes();
  }

  @Get('package-configs')
  packageConfigs() {
    return this.configurator.listPackageConfigs(true);
  }

  @Get('session/active')
  @UseGuards(JwtAuthGuard)
  activeSession(@CurrentUser() user: User) {
    return this.configurator.getActiveSession(user.id);
  }

  @Get('passports/:publicId')
  publicPassport(@Param('publicId') publicId: string) {
    return this.configurator.getPublicPassport(publicId);
  }

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  createSession(@CurrentUser() user: User, @Body() dto: CreateConfiguratorSessionDto) {
    return this.configurator.createSession(user.id, dto);
  }

  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard)
  getSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.configurator.getSession(user.id, id);
  }

  @Post('sessions/:id/products')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  addProduct(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddConfiguratorProductDto,
  ) {
    return this.configurator.addProduct(user.id, id, dto);
  }

  @Patch('sessions/:id/products/:productId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  updateProduct(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateConfiguratorProductDto,
  ) {
    return this.configurator.updateProduct(user.id, id, productId, dto);
  }

  @Post('sessions/:id/products/:productId/approve')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  approveProduct(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() dto: ApproveConfiguratorProductDto,
  ) {
    return this.configurator.approveProduct(user.id, id, productId, dto);
  }

  @Post('sessions/:id/finalize')
  @UseGuards(JwtAuthGuard)
  finalize(@CurrentUser() user: User, @Param('id') id: string) {
    return this.configurator.finalizeSession(user.id, id);
  }

  @Post('sessions/:id/lock')
  @UseGuards(JwtAuthGuard)
  lock(@CurrentUser() user: User, @Param('id') id: string) {
    return this.configurator.lockSession(id, user.id);
  }
}

@Controller('admin/coin-configurator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class CoinConfiguratorAdminController {
  constructor(private readonly configurator: CoinConfiguratorService) {}

  @Get('package-configs')
  listConfigs() {
    return this.configurator.listPackageConfigs(false);
  }

  @Get('pending-products')
  pendingProducts() {
    return this.configurator.adminListPendingProducts();
  }

  @Patch('package-configs/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  updateConfig(@Param('id') id: string, @Body() dto: UpdatePackageConfigDto) {
    return this.configurator.adminUpdatePackageConfig(id, dto);
  }

  @Post('products/:productId/verify-weight')
  verifyWeight(
    @Param('productId') productId: string,
    @Body() body: { verifiedWeightG: number },
  ) {
    return this.configurator.adminVerifyProductWeight(productId, body.verifiedWeightG);
  }
}
