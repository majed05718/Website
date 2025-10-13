import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterPaymentsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  contract_id?: string;

  @IsOptional()
  @IsString()
  tenant_phone?: string;

  @IsOptional()
  @IsDateString()
  due_from?: string;

  @IsOptional()
  @IsDateString()
  due_to?: string;
}
