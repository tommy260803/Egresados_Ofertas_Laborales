import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Empresa } from "./empresa.entity";
import { Postulacion } from "./postulacion.entity";
import { Habilidad } from "./habilidad.entity";

@Entity("ofertas_laborales")
export class OfertaLaboral {
  @PrimaryGeneratedColumn()
  id_oferta: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.ofertas, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_empresa" })
  empresa: Empresa;

  @Column()
  titulo: string;

  @Column({ type: "text" })
  descripcion: string;

  @Column({ type: "varchar", length: 30 })
  modalidad: "presencial" | "remoto" | "hibrido";

  @Column({ nullable: true })
  ubicacion: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  salario_minimo: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  salario_maximo: number;

  @Column({ default: "mensual" })
  tipo_salario: string;

  @Column({ default: "completa" })
  jornada: string;

  @Column({ nullable: true })
  experiencia_requerida: string;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  fecha_publicacion: Date;

  @Column({ type: "date", nullable: true })
  fecha_cierre: Date;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @OneToMany(() => Postulacion, (postulacion) => postulacion.oferta)
  postulaciones: Postulacion[];

  @ManyToMany(() => Habilidad)
  @JoinTable({
    name: "ofertas_habilidades",
    joinColumn: { name: "id_oferta", referencedColumnName: "id_oferta" },
    inverseJoinColumn: {
      name: "id_habilidad",
      referencedColumnName: "id_habilidad",
    },
  })
  habilidades: Habilidad[];
}
