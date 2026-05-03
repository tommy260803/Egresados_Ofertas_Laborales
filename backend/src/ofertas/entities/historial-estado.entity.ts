import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Postulacion } from './postulacion.entity';
import { Usuario } from '../../auth/entities/usuario.entity';

@Entity('historial_estados_postulacion')
export class HistorialEstado {
  @PrimaryGeneratedColumn()
  id_historial: number;

  @ManyToOne(() => Postulacion, { onDelete: 'CASCADE' })
  postulacion: Postulacion;

  @Column({ nullable: true })
  estado_anterior: string;

  @Column()
  estado_nuevo: string;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha_cambio: Date;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  modificado_por: Usuario;
}