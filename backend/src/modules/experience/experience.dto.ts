import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MeasurementsDto {
  @IsOptional() @IsNumber() @Min(50) @Max(250) height?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(250) shoulders?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(300) chest?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(300) waist?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(300) hips?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(100) neck?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(60) wrist?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(15) finger?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(60) foot?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(100) head?: number;
}
export class FitDto {
  @IsBoolean() consent: boolean;
  @ValidateNested() @Type(() => MeasurementsDto) measurements: MeasurementsDto;
}
export class ProposalDto {
  @IsUUID() sourceProductId: string;
  @IsOptional() @IsUUID() parentProposalId?: string;
  @IsOptional() @IsString() @MaxLength(80) material?: string;
  @IsOptional() @IsString() @MaxLength(3) initials?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
export class MuseumPageDto {
  @IsOptional() @IsString() @Matches(/^\d{1,6}$/) page?: string;
}
export class PublicationRequestDto {
  @IsBoolean() consent: boolean;
}
export class InteractionDto {
  @IsIn(['LIKE', 'SAVE']) kind: 'LIKE' | 'SAVE';
  @IsBoolean() active: boolean;
}
