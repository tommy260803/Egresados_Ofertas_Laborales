import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id_notificacion: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario_destinatario' })
  id_usuario_destinatario: Usuario;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  asunto: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_envio: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ nullable: true })
  id_referencia: number;
}