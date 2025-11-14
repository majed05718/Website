import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('customer_interactions')
export class CustomerInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  customer_id: string;

  @Index()
  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'uuid', nullable: true })
  property_id: string;

  @Column({ type: 'uuid', nullable: true })
  contract_id: string;

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  next_follow_up: Date;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  staff_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Composite indexes for interaction queries
  @Index(['customer_id', 'date'])
  composite_customer_date?: void;

  @Index(['customer_id', 'type'])
  composite_customer_type?: void;

  @Index(['staff_id', 'date'])
  composite_staff_date?: void;

  @Index(['next_follow_up'])
  idx_next_follow_up?: void;
}
