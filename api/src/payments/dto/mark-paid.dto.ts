import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class MarkPaidDto {
  @IsNotEmpty({ message: 'قيمة amount_paid مطلوبة' })
  @IsNumberString({}, { message: 'amount_paid يجب أن يكون رقمياً' })
  amount_paid!: string;

  @IsOptional()
  @IsString()
  payment_method?: string; // cash, transfer, card, ...

  @IsOptional()
  @IsString()
  @Length(0, 128)
  payment_reference?: string;
}
