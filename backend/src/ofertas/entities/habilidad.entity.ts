import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Egresado } from '../../egresados/entities/egresado.entity';
import { OfertaLaboral } from './oferta-laboral.entity';

@Entity('habilidades')
export class Habilidad {
  @PrimaryGeneratedColumn()
  id_habilidad: number;

  @Column({ unique: true })
  nombre_habilidad: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  categoria: string;

  @ManyToMany(() => Egresado, egresado => egresado.habilidades)
  egresados: Egresado[];

  @ManyToMany(() => OfertaLaboral, oferta => oferta.habilidades)
  ofertas: OfertaLaboral[];
}