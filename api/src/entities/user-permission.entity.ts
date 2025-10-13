import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user_permissions' })
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'office_id', type: 'varchar' })
  officeId!: string;

  @Index()
  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @Column({ name: 'role', type: 'varchar' })
  role!: string; // manager, staff, technician, accountant, owner, tenant

  @Column({ name: 'status', type: 'varchar', default: 'active' })
  status!: string; // active, inactive

  @Column({ name: 'permissions', type: 'jsonb', nullable: true })
  permissions!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
