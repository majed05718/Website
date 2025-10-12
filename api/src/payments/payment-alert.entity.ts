import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Contract } from './rental.contract.entity';
import { RentalPayment } from './rental-payment.entity';

// كيان تنبيهات المدفوعات
@Entity({ name: 'payment_alerts' })
export class PaymentAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'office_id', type: 'varchar' })
  officeId!: string;

  @Index()
  @Column({ name: 'contract_id', type: 'uuid' })
  contractId!: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract!: Contract;

  @Index()
  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId!: string;

  @ManyToOne(() => RentalPayment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment!: RentalPayment;

  @Column({ name: 'alert_type', type: 'varchar' })
  alertType!: string; // reminder, due, overdue_3, overdue_7, overdue_14

  @Column({ name: 'alert_level', type: 'int', default: 0 })
  alertLevel!: number;

  @CreateDateColumn({ name: 'alert_date', type: 'timestamptz' })
  alertDate!: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'amount', type: 'numeric', precision: 14, scale: 2, nullable: true })
  amount!: string | null;

  @Column({ name: 'days_overdue', type: 'int', nullable: true })
  daysOverdue!: number | null;

  @Column({ name: 'late_fee', type: 'numeric', precision: 14, scale: 2, nullable: true })
  lateFee!: string | null;

  @Column({ name: 'is_sent', type: 'boolean', default: false })
  isSent!: boolean;

  @Column({ name: 'sent_date', type: 'timestamptz', nullable: true })
  sentDate!: Date | null;

  @Column({ name: 'tenant_phone', type: 'varchar', nullable: true })
  tenantPhone!: string | null;

  @Column({ name: 'tenant_name', type: 'varchar', nullable: true })
  tenantName!: string | null;
}
