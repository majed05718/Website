import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerNoteDto {
  @ApiProperty({ example: 'العميل مهتم بالشقق في شمال الرياض', description: 'محتوى الملاحظة' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: false, description: 'هل الملاحظة مهمة؟' })
  @IsBoolean()
  @IsOptional()
  is_important?: boolean;

  @ApiPropertyOptional({ example: { category: 'follow_up' }, description: 'الوسوم' })
  @IsObject()
  @IsOptional()
  tags?: any;
}
