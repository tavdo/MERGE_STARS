import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SubmitApplicationDto {
  @IsString()
  @IsNotEmpty()
  coinType: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  metalPurity?: number;

  @IsNumber()
  coinValue: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
