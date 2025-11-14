import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('customer_properties')
export class CustomerProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  customer_id: string;

  @Index()
  @Column({ type: 'uuid' })
  property_id: string;

  @Index()
  @Column({ type: 'varchar' })
  relationship: string;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  viewed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  interested_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Composite indexes for relationship queries
  @Index(['customer_id', 'property_id'])
  composite_customer_property?: void;

  @Index(['property_id', 'relationship'])
  composite_property_relationship?: void;

  @Index(['customer_id', 'relationship'])
  composite_customer_relationship?: void;
}
