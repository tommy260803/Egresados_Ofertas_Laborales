import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Egresado } from '../../egresados/entities/egresado.entity';
import { Empresa } from '../../ofertas/entities/empresa.entity';
import { Administrador } from '../../auth/entities/administrador.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ unique: true })
  email: string;

  @Column()
  contrasena_hash: string;

  @Column({ type: 'varchar', length: 20 })
  rol: 'administrador' | 'egresado' | 'empresa';

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  invitation_token: string;

  @Column({ type: 'timestamptz', nullable: true })
  invitation_expires: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => Egresado, egresado => egresado.usuario)
  egresado: Egresado;

  @OneToOne(() => Empresa, empresa => empresa.usuario)
  empresa: Empresa;

  @OneToOne(() => Administrador, admin => admin.usuario)
  administrador: Administrador;
}