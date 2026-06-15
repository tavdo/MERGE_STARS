import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  personalId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  verificationCode?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  phoneVerificationCode?: string;
}

export class SendVerificationCodeDto {
  @IsEmail()
  email: string;
}

export class SendPhoneVerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
