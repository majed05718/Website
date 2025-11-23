import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  request_number: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  property_id: string;

  @Column({ type: 'varchar', nullable: true })
  tenant_phone: string;

  @Column({ type: 'varchar', nullable: true })
  tenant_name: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Index()
  @Column({ type: 'varchar' })
  issue_type: string;

  @Index()
  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Index()
  @Column({ type: 'varchar', default: 'new' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  before_images: string[];

  @Column({ type: 'jsonb', nullable: true })
  after_images: string[];

  @Column({ type: 'varchar', nullable: true })
  assigned_technician: string;

  @Column({ type: 'varchar', nullable: true })
  technician_name: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimated_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actual_cost: number;

  @Column({ type: 'varchar', nullable: true })
  who_pays: string;

  @Column({ type: 'text', nullable: true })
  technician_notes: string;

  @Column({ type: 'int', nullable: true })
  tenant_rating: number;

  @Column({ type: 'text', nullable: true })
  tenant_feedback: string;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite indexes for efficient maintenance queries
  @Index(['office_id', 'status'])
  composite_office_status?: void;

  @Index(['property_id', 'status'])
  composite_property_status?: void;

  @Index(['status', 'priority'])
  composite_status_priority?: void;

  @Index(['assigned_technician', 'status'])
  composite_technician_status?: void;
}
