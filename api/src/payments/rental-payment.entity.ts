import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Contract } from './rental.contract.entity';

// كيان دفعات الإيجار
@Entity({ name: 'rental_payments' })
export class RentalPayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'office_id', type: 'varchar' })
  officeId!: string;

  @Index()
  @Column({ name: 'contract_id', type: 'uuid' })
  contractId!: string;

  @ManyToOne(() => Contract, (c) => c.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract!: Contract;

  @Index()
  @Column({ name: 'status', type: 'varchar', default: 'pending' })
  status!: string; // pending | paid | cancelled

  @Index()
  @Column({ name: 'due_date', type: 'date' })
  dueDate!: string; // YYYY-MM-DD

  @Column({ name: 'amount_due', type: 'numeric', precision: 14, scale: 2 })
  amountDue!: string; // كنص رقمي

  @Column({ name: 'paid_date', type: 'timestamptz', nullable: true })
  paidDate!: Date | null;

  @Column({ name: 'amount_paid', type: 'numeric', precision: 14, scale: 2, nullable: true })
  amountPaid!: string | null;

  @Column({ name: 'payment_method', type: 'varchar', nullable: true })
  paymentMethod!: string | null; // cash, transfer, card, ...

  @Column({ name: 'payment_reference', type: 'varchar', nullable: true })
  paymentReference!: string | null;

  @Column({ name: 'office_commission', type: 'numeric', precision: 14, scale: 2, nullable: true })
  officeCommission!: string | null;

  @Column({ name: 'owner_amount', type: 'numeric', precision: 14, scale: 2, nullable: true })
  ownerAmount!: string | null;

  @Index()
  @Column({ name: 'tenant_phone', type: 'varchar', nullable: true })
  tenantPhone!: string | null;

  @Column({ name: 'tenant_name', type: 'varchar', nullable: true })
  tenantName!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
