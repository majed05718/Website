import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportRowDto {
  @IsString() property_code!: string;
  @IsString() property_type!: string;
  @IsString() listing_type!: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location_city?: string;
  @IsOptional() @IsString() location_district?: string;
  @IsOptional() @IsString() location_street?: string;
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() area_sqm?: string;
  @IsOptional() @IsString() bedrooms?: string;
  @IsOptional() @IsString() bathrooms?: string;
  @IsOptional() @IsObject() features?: Record<string, any>;
  @IsOptional() @IsString() contact_person?: string;
  @IsOptional() @IsString() contact_phone?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsBoolean() is_featured?: boolean;
}

export class ImportExcelDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportRowDto)
  rows!: ImportRowDto[];
}
