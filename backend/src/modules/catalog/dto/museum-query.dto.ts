import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class MuseumQueryDto {
  @IsOptional() @IsString() @MaxLength(120) q?: string;
  @IsOptional() @IsString() @MaxLength(32) category?: string;
  @IsOptional() @IsString() @MaxLength(120) brand?: string;
  @IsOptional() @IsString() @MaxLength(120) material?: string;
  @IsOptional() @IsString() @Matches(/^\d{1,6}$/) page?: string;
}
