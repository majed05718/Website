import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  token_hash: string;

  @Index()
  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  device_info: any;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', nullable: true })
  user_agent: string;

  @Column({ type: 'boolean', default: false })
  is_revoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  // Composite index for user token queries
  @Index(['user_id', 'expires_at'])
  composite_user_expires?: void;

  @Index(['user_id', 'is_revoked'])
  composite_user_revoked?: void;
}
