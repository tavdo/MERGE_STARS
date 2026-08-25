import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { CONFIGURATOR_PRODUCT_TYPES } from '../configurator.constants';

const PRODUCT_KEYS = CONFIGURATOR_PRODUCT_TYPES.map((p) => p.key);

export class CreateConfiguratorSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  packageKg?: number;

  @IsOptional()
  @IsUUID()
  packageConfigId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceBrandHouseId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sourceQrRef?: string;
}

export class AddConfiguratorProductDto {
  @IsString()
  @IsIn(PRODUCT_KEYS)
  productType: string;
}

export class UpdateConfiguratorProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  prompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  meshyJobId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  model3dUrl?: string;

  @IsOptional()
  @IsIn(['drafting', 'generating', 'generated', 'approved', 'cad_review', 'verified'])
  status?: string;
}

export class ApproveConfiguratorProductDto {
  @IsOptional()
  @IsIn(['private', 'catalog'])
  visibility?: 'private' | 'catalog';

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedWeightG?: number;
}

export class UpdatePackageConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  packageKg?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  caseWeightG?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  productCapacityG?: number;

  @IsOptional()
  isDefault?: boolean;

  @IsOptional()
  isActive?: boolean;
}
