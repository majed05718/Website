import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteAppointmentDto {
  @ApiProperty({ example: 'تمت المعاينة بنجاح، العميل مهتم بالعقار', description: 'ملاحظات الإتمام' })
  @IsString()
  completionNotes: string;
}
