import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'office_id', type: 'varchar' })
  officeId!: string;

  @Index()
  @Column({ name: 'user_phone', type: 'varchar', nullable: true })
  userPhone!: string | null;

  @Column({ name: 'user_role', type: 'varchar', nullable: true })
  userRole!: string | null;

  @Column({ name: 'user_name', type: 'varchar', nullable: true })
  userName!: string | null;

  @Column({ name: 'message_text', type: 'text', nullable: true })
  messageText!: string | null;

  @Column({ name: 'message_type', type: 'varchar', nullable: true })
  messageType!: string | null;

  @Column({ name: 'intent', type: 'varchar', nullable: true })
  intent!: string | null;

  @Column({ name: 'confidence_score', type: 'numeric', precision: 5, scale: 3, nullable: true })
  confidenceScore!: string | null;

  @Column({ name: 'sentiment', type: 'varchar', nullable: true })
  sentiment!: string | null;

  @Index()
  @Column({ name: 'direction', type: 'varchar', default: 'incoming' })
  direction!: string; // incoming | outgoing

  @Column({ name: 'handled_by', type: 'varchar', nullable: true })
  handledBy!: string | null; // user_id or 'ai'

  @Column({ name: 'response_time_seconds', type: 'int', nullable: true })
  responseTimeSeconds!: number | null;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status!: string | null; // open, closed

  @Column({ name: 'ai_tokens_used', type: 'int', nullable: true })
  aiTokensUsed!: number | null;

  @Column({ name: 'ai_cost_usd', type: 'numeric', precision: 10, scale: 4, nullable: true })
  aiCostUsd!: string | null;

  @Column({ name: 'session_id', type: 'varchar', nullable: true })
  sessionId!: string | null;

  @Column({ name: 'conversation_context', type: 'jsonb', nullable: true })
  conversationContext!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
