import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumberString, IsObject, IsOptional, IsString, IsUrl, Length, Max, MaxLength, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePropertyDto {
  @IsString({ message: 'رمز العقار مطلوب كنص' })
  @Length(2, 64, { message: 'طول رمز العقار بين 2 و 64' })
  property_code!: string;

  @IsString({ message: 'نوع العقار مطلوب' })
  property_type!: string;

  @IsString({ message: 'نوع العرض مطلوب' })
  listing_type!: string;

  @IsOptional()
  @IsString()
  location_city?: string;

  @IsOptional()
  @IsString()
  location_district?: string;

  @IsOptional()
  @IsString()
  location_street?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'السعر يجب أن يكون رقمياً' })
  price?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'المساحة يجب أن تكون رقمية' })
  area_sqm?: string;

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
  @IsObject()
  features?: Record<string, any>;

  @IsString()
  @Length(2, 200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  contact_person?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsUrl({}, { message: 'رابط خرائط قوقل غير صالح' })
  google_maps_link?: string;

  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}
