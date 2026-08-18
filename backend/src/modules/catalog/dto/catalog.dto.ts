import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CATALOG_CATEGORIES } from '../catalog-categories';
import { MASTER_HOUSE_KEYS } from '../master-houses';

const CATEGORY_VALUES = [...CATALOG_CATEGORIES];

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility: 'PUBLIC' | 'PRIVATE';

  @IsOptional()
  @IsIn(CATEGORY_VALUES)
  category?: (typeof CATALOG_CATEGORIES)[number];
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility?: 'PUBLIC' | 'PRIVATE';

  @IsOptional()
  @IsIn(CATEGORY_VALUES)
  category?: (typeof CATALOG_CATEGORIES)[number];
}

export class CreateCatalogItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  metalType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  /** Attach an already-generated Meshy GLB without re-uploading from the browser. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  meshyJobId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceUsd?: number;
}

export class UpdateCatalogItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  metalType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'ARCHIVED'])
  status?: 'ACTIVE' | 'ARCHIVED';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceUsd?: number | null;
}

export class MoveCatalogItemDto {
  @IsUUID()
  collectionId: string;
}

export class CreateMasterProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsIn([...MASTER_HOUSE_KEYS])
  house: (typeof MASTER_HOUSE_KEYS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  metalType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceUsd?: number;
}

export class AddBrandRoomPickDto {
  @IsUUID()
  catalogItemId: string;
}

export class UpdateMasterProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn([...MASTER_HOUSE_KEYS])
  house?: (typeof MASTER_HOUSE_KEYS)[number];

  @IsOptional()
  @IsIn(['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  lifecycle?: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

  @IsOptional()
  @IsEnum(['ACTIVE', 'ARCHIVED'])
  status?: 'ACTIVE' | 'ARCHIVED';
}

export class MeshyGenerateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  prompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  style?: string;

  @IsOptional()
  @IsString()
  collectionId?: string;
}
