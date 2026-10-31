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
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ExperienceService } from './experience.service';
import { FitDto, ProposalDto, InteractionDto, MuseumPageDto, PublicationRequestDto } from './experience.dto';

@Controller('experience')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class ExperienceController {
  constructor(private readonly service: ExperienceService) {}
  @Get('museum') @UseGuards(JwtAuthGuard) museum(@CurrentUser() user: User, @Query() query: MuseumPageDto) {
    return this.service.personalMuseum(user, Number(query.page ?? 0));
  }
  @Post('designs/:id/publication-request') @UseGuards(JwtAuthGuard) publication(
    @CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string, @Body() dto: PublicationRequestDto,
  ) {
    return this.service.requestPublication(user.id, id, dto.consent);
  }
  @Get('saved') @UseGuards(JwtAuthGuard) saved(@CurrentUser() user: User) {
    return this.service.savedProducts(user.id);
  }
  @Get('review-queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  reviewQueue() {
    return this.service.reviewQueue();
  }
  @Get('products/:id') product(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.publicProduct(id);
  }
  @Get('fit') @UseGuards(JwtAuthGuard) fit(@CurrentUser() user: User) {
    return this.service.getFit(user.id);
  }
  @Patch('fit') @UseGuards(JwtAuthGuard) saveFit(
    @CurrentUser() user: User,
    @Body() dto: FitDto,
  ) {
    return this.service.saveFit(user.id, dto);
  }
  @Delete('fit') @UseGuards(JwtAuthGuard) removeFit(@CurrentUser() user: User) {
    return this.service.removeFit(user.id);
  }
  @Get('designs') @UseGuards(JwtAuthGuard) designs(@CurrentUser() user: User) {
    return this.service.listProposals(user.id);
  }
  @Post('designs') @UseGuards(JwtAuthGuard) design(
    @CurrentUser() user: User,
    @Body() dto: ProposalDto,
  ) {
    return this.service.createProposal(user, dto);
  }
  @Post('designs/:id/verification') @UseGuards(JwtAuthGuard) verify(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.requestVerification(user.id, id);
  }
  @Get('products/:id/interaction') @UseGuards(JwtAuthGuard) state(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.interactionState(user.id, id);
  }
  @Patch('products/:id/interaction') @UseGuards(JwtAuthGuard) interact(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InteractionDto,
  ) {
    return this.service.interaction(user.id, id, dto);
  }
  @Get('pulse') @UseGuards(JwtAuthGuard) pulse(@CurrentUser() user: User) {
    return this.service.pulse(user.id);
  }
}
