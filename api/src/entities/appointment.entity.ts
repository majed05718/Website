import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'varchar' })
  type: string;

  @Index()
  @Column({ type: 'varchar', default: 'scheduled' })
  status: string;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  property_id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  customer_id: string;

  @Index()
  @Column({ type: 'uuid' })
  assigned_staff_id: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  meeting_link: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  completion_notes: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'uuid', nullable: true })
  cancelled_by: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite indexes for efficient scheduling queries
  @Index(['office_id', 'date', 'status'])
  composite_office_date_status?: void;

  @Index(['assigned_staff_id', 'date', 'status'])
  composite_staff_date_status?: void;

  @Index(['date', 'start_time', 'end_time'])
  composite_date_time?: void;

  @Index(['office_id', 'assigned_staff_id', 'date', 'start_time', 'end_time'])
  composite_conflict_check?: void;
}
