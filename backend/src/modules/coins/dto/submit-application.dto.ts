import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class SubmitApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  brandHouseName: string;

  @IsString()
  @IsNotEmpty()
  coinType: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  metalPurity?: number;

  @IsOptional()
  @IsIn(['silver', 'gold', 'premium'])
  metalType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coinValue?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  personalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  financingPreference?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  financingTermMonths?: number;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  /** Public catalog design to mint with — author gets 50% of paid coin value */
  @IsOptional()
  @IsString()
  catalogItemId?: string;

@IsOptional()
  @IsString()
  configuratorSessionId?: string;
}
