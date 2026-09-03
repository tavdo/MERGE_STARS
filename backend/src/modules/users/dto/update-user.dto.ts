import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && String(v).trim() !== '')
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  nickname?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  /** Partial map of platform → URL / WhatsApp phone / Telegram handle */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsObject()
  socialLinks?: Record<string, string | null>;
}
