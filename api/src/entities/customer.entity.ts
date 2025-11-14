// api/src/customers/entities/customer.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

// تعريف الأنواع المحددة التي يتوقعها الكود
export type CustomerStatus = 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted';
export type CustomerType = 'individual' | 'corporate';
export type ContactMethod = 'phone' | 'email' | 'whatsapp';

@Entity('customers') // هذا يخبر TypeORM أن هذا الكلاس يمثل جدول اسمه "customers"
export class Customer {
    @PrimaryGeneratedColumn('uuid') // مفتاح أساسي فريد من نوع UUID
    id: string;

    @Column()
    name: string;

    @Column({ unique: true }) // رقم الهاتف يجب أن يكون فريدًا
    phone: string;

    @Column({ nullable: true }) // البريد الإلكتروني اختياري
    email?: string;

    @Column({ nullable: true })
    nationalId?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({
        type: 'enum',
        enum: ['individual', 'corporate'],
        default: 'individual',
    })
    type: CustomerType;

    @Column({
        type: 'enum',
        enum: ['new', 'contacted', 'interested', 'not_interested', 'converted'],
        default: 'new',
    })
    status: CustomerStatus;

    @Column({
        type: 'enum',
        enum: ['phone', 'email', 'whatsapp'],
        default: 'phone',
    })
    preferredContactMethod: ContactMethod;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ nullable: true })
    source?: string; // مصدر العميل (e.g., "Website", "Referral")

    @Column({ type: 'decimal', nullable: true })
    budgetMin?: number;

    @Column({ type: 'decimal', nullable: true })
    budgetMax?: number;

    @Column({
        type: 'simple-array', // يخزن مصفوفة من النصوص في عمود واحد
        nullable: true,
    })

    preferredCities?: string[];

    @Column({
        type: 'simple-array',
        nullable: true,
    })
    preferredPropertyTypes?: string[];

    @Column({ nullable: true })
    assignedStaff?: string;

    @CreateDateColumn() // تاريخ إنشاء السجل تلقائيًا
    createdAt: Date;

    @UpdateDateColumn() // تاريخ آخر تحديث للسجل تلقائيًا
    updatedAt: Date;
}