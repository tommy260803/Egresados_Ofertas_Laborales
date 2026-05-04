import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { OfertaLaboral } from "./oferta-laboral.entity";
import { Egresado } from "../../egresados/entities/egresado.entity";

@Entity("postulaciones")
export class Postulacion {
  @PrimaryGeneratedColumn()
  id_postulacion: number;

  @ManyToOne(() => OfertaLaboral, (oferta) => oferta.postulaciones, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_oferta" })
  oferta: OfertaLaboral;

  @ManyToOne(() => Egresado, (egresado) => egresado.postulaciones, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_egresado" })
  egresado: Egresado;

  @Column({ default: "postulado" })
  estado_actual: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  fecha_postulacion: Date;

  @Column({ type: "text", nullable: true })
  mensaje: string;

  @Column({ nullable: true })
  cv_postulacion_url: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
