import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendVerificationCodeDto,
} from './dto/auth.dto';

const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, token: string) {
  const days = Number(process.env.JWT_REFRESH_DAYS ?? 7);
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: days * 86400000,
    path: '/',
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}

@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('send-verification-code')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  sendVerificationCode(@Body() dto: SendVerificationCodeDto) {
    return this.auth.sendVerificationCode(dto.email);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      clearRefreshCookie(res);
      return { accessToken: null };
    }
    const result = await this.auth.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(token);
    clearRefreshCookie(res);
    return { ok: true };
  }
}
