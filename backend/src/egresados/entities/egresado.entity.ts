import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Habilidad } from '../../ofertas/entities/habilidad.entity';
import { Postulacion } from '../../ofertas/entities/postulacion.entity';

@Entity('egresados')
export class Egresado {
  @PrimaryColumn()
  id_egresado: number;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ nullable: true })
  documento_identidad: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ nullable: true })
  genero: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ nullable: true })
  ciudad: string;

  @Column()
  carrera: string;

  @Column({ nullable: true })
  universidad: string;

  @Column({ nullable: true })
  anio_graduacion: number;

  @Column({ type: 'text', nullable: true })
  perfil_laboral: string;

  @Column({ nullable: true })
  cv_url: string;

  @Column({ nullable: true })
  foto_url: string;

  @Column({ nullable: true })
  linkedin_url: string;

  @Column({ nullable: true })
  github_url: string;

  @Column({ nullable: true })
  id_usuario: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToMany(() => Habilidad)
  @JoinTable({
    name: 'egresados_habilidades',
    joinColumn: { name: 'id_egresado', referencedColumnName: 'id_egresado' },
    inverseJoinColumn: { name: 'id_habilidad', referencedColumnName: 'id_habilidad' },
  })
  habilidades: Habilidad[];

  @OneToMany(() => Postulacion, post => post.egresado)
  postulaciones: Postulacion[];
}