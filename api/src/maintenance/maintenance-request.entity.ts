import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Property } from '../properties/properties.entity';

@Entity({ name: 'maintenance_requests' })
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'office_id', type: 'varchar' })
  officeId!: string;

  @Index()
  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  propertyId!: string | null;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property?: Property | null;

  @Index({ unique: true })
  @Column({ name: 'request_number', type: 'varchar' })
  requestNumber!: string; // MNT-{office_code}-{year}-{seq}

  @Index()
  @Column({ name: 'tenant_phone', type: 'varchar', nullable: true })
  tenantPhone!: string | null;

  @Column({ name: 'tenant_name', type: 'varchar', nullable: true })
  tenantName!: string | null;

  @Index()
  @Column({ name: 'issue_type', type: 'varchar' })
  issueType!: string; // plumbing, electrical, ac, appliance, other

  @Index()
  @Column({ name: 'priority', type: 'varchar', default: 'medium' })
  priority!: string; // low, medium, high, urgent

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Index()
  @Column({ name: 'status', type: 'varchar', default: 'new' })
  status!: string; // new, in_progress, completed, closed

  @Column({ name: 'assigned_technician', type: 'varchar', nullable: true })
  assignedTechnician!: string | null; // user_id

  @Column({ name: 'technician_name', type: 'varchar', nullable: true })
  technicianName!: string | null;

  @Column({ name: 'scheduled_date', type: 'timestamptz', nullable: true })
  scheduledDate!: Date | null;

  @Column({ name: 'estimated_cost', type: 'numeric', precision: 14, scale: 2, nullable: true })
  estimatedCost!: string | null;

  @Column({ name: 'actual_cost', type: 'numeric', precision: 14, scale: 2, nullable: true })
  actualCost!: string | null;

  @Column({ name: 'who_pays', type: 'varchar', nullable: true })
  whoPays!: string | null; // tenant, owner, office, split

  @Column({ name: 'tenant_rating', type: 'int', nullable: true })
  tenantRating!: number | null;

  @Column({ name: 'tenant_feedback', type: 'text', nullable: true })
  tenantFeedback!: string | null;

  @Column({ name: 'technician_notes', type: 'text', nullable: true })
  technicianNotes!: string | null;

  @Column({ name: 'before_images', type: 'text', array: true, nullable: true })
  beforeImages!: string[] | null;

  @Column({ name: 'after_images', type: 'text', array: true, nullable: true })
  afterImages!: string[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}
