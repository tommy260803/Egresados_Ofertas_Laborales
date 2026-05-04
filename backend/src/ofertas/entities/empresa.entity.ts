import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { OfertaLaboral } from './oferta-laboral.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryColumn()
  id_empresa: number;

  @Column()
  razon_social: string;

  @Column({ nullable: true, unique: true })
  ruc: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  sitio_web: string;

  @Column({ nullable: true })
  telefono_contacto: string;

  @Column({ nullable: true })
  email_contacto: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ nullable: true })
  ciudad: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ default: false })
  verificada: boolean;

  @OneToOne(() => Usuario, usuario => usuario.empresa)
  @JoinColumn({ name: 'id_empresa' })
  usuario: Usuario;

  @OneToMany(() => OfertaLaboral, oferta => oferta.empresa)
  ofertas: OfertaLaboral[];
}