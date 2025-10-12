import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RentalPayment } from './rental-payment.entity';
import { Property } from '../properties/properties.entity';

// عقد مبسط للاستخدام داخل المدفوعات (اختصاراً)
@Entity({ name: 'rental_contracts' })
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'office_id', type: 'varchar' })
  officeId!: string;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId!: string | null;

  @Column({ name: 'office_commission_rate', type: 'numeric', precision: 7, scale: 4, default: 0 })
  officeCommissionRate!: string; // نسبة مئوية

  @OneToMany(() => RentalPayment, (p) => p.contract)
  payments!: RentalPayment[];
}
