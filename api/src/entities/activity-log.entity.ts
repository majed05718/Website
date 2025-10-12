import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// كيان سجلات النشاط activity_logs
@Entity({ name: 'activity_logs' })
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'office_id', type: 'varchar', nullable: true })
  officeId!: string | null;

  @Column({ name: 'user_phone', type: 'varchar', nullable: true })
  userPhone!: string | null;

  @Column({ name: 'user_role', type: 'varchar', nullable: true })
  userRole!: string | null;

  @Column({ name: 'activity_type', type: 'varchar', nullable: true })
  activityType!: string | null;

  @Column({ name: 'entity_type', type: 'varchar', nullable: true })
  entityType!: string | null;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId!: string | null;

  @Column({ name: 'request_data', type: 'jsonb', nullable: true })
  requestData!: Record<string, any> | null;

  @Column({ name: 'response_data', type: 'jsonb', nullable: true })
  responseData!: Record<string, any> | null;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status!: string | null; // success | error

  @Column({ name: 'processing_time', type: 'int', nullable: true })
  processingTime!: number | null; // بالمللي ثانية

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
