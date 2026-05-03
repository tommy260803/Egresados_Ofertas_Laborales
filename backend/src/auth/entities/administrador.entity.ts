import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('administradores')
export class Administrador {
  @PrimaryColumn()
  id_administrador: number;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ default: 'basico' })
  nivel: string;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_administrador' })
  usuario: Usuario;
}