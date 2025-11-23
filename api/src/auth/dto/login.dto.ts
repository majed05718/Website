import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @Matches(/^(\+?9665\d{8}|05\d{8}|5\d{8})$/, {
    message: 'رقم الجوال يجب أن يكون بالصيغة السعودية الصحيحة (إما 9 أرقام تبدأ بـ 5، أو 12 رقمًا تبدأ بـ 9665)',
 })
  @IsNotEmpty({ message: 'رقم الجوال مطلوب' })
  phone: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  password: string;
}
