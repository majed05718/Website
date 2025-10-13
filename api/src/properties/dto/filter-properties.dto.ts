import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';

export class FilterPropertiesDto {
  @IsOptional()
  @IsString()
  type?: string; // property_type

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsNumberString()
  min_price?: string;

  @IsOptional()
  @IsNumberString()
  max_price?: string;

  @IsOptional()
  @IsNumberString()
  min_area?: string;

  @IsOptional()
  @IsNumberString()
  max_area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => ['true', true, '1', 1].includes(value))
  is_featured?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['created_at', 'price', 'area'])
  order_by?: 'created_at' | 'price' | 'area';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
