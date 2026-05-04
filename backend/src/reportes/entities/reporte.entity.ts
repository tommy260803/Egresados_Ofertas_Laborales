import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Usuario } from "../../auth/entities/usuario.entity";

@Entity("reportes")
export class Reporte {
  @PrimaryGeneratedColumn()
  id_reporte: number;

  @Column()
  nombre_reporte: string;

  @Column()
  tipo_reporte: string;

  @Column({ type: "jsonb", nullable: true })
  parametros: Record<string, unknown>;

  @Column({ nullable: true })
  url_pdf: string;

  @ManyToOne(() => Usuario, { onDelete: "SET NULL" })
  @JoinColumn({ name: "generado_por" })
  generado_por: Usuario;

  @CreateDateColumn({ type: "timestamptz" })
  fecha_solicitud: Date;

  @Column({ type: "timestamptz", nullable: true })
  fecha_completado: Date;

  @Column({ default: "pendiente" })
  estado: string;

  @Column({ nullable: true })
  tamano_bytes: number;
}
