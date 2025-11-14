import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('customer_notes')
export class CustomerNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  is_important: boolean;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  // Composite indexes for note queries
  @Index(['customer_id', 'created_at'])
  composite_customer_date?: void;

  @Index(['customer_id', 'is_important'])
  composite_customer_important?: void;
}
