import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() phone: string;
  @ApiPropertyOptional() @IsString() @IsOptional() email?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() nationalId?: string;
  @ApiProperty() @IsEnum(['buyer', 'seller', 'tenant', 'landlord', 'both']) type: string;
  @ApiPropertyOptional() @IsEnum(['active', 'inactive', 'potential', 'archived']) @IsOptional() status?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() address?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() city?: string;
  @ApiPropertyOptional() @IsEnum(['phone', 'whatsapp', 'email', 'in_person']) @IsOptional() preferredContactMethod?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
  @ApiPropertyOptional() @IsArray() @IsOptional() tags?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() source?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() rating?: number;
}
