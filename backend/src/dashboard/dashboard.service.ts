import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
} from "typeorm";
import { Egresado } from "../egresados/entities/egresado.entity";
import { Empresa } from "../ofertas/entities/empresa.entity";
import { OfertaLaboral } from "../ofertas/entities/oferta-laboral.entity";
import { Postulacion } from "../ofertas/entities/postulacion.entity";

export interface DashboardFilters {
  from?: Date;
  to?: Date;
  carrera?: string;
  sector?: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Egresado) private egresadoRepo: Repository<Egresado>,
    @InjectRepository(Empresa) private empresaRepo: Repository<Empresa>,
    @InjectRepository(OfertaLaboral)
    private ofertaRepo: Repository<OfertaLaboral>,
    @InjectRepository(Postulacion)
    private postulacionRepo: Repository<Postulacion>,
  ) {}

  async getAdminKpis(filters?: DashboardFilters) {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    const totalEgresadosQb = this.egresadoRepo.createQueryBuilder("e");
    if (filters?.carrera) {
      totalEgresadosQb.where("e.carrera = :carrera", {
        carrera: filters.carrera,
      });
    }
    const totalEgresados = await totalEgresadosQb.getCount();

    const totalEmpresasQb = this.empresaRepo.createQueryBuilder("em");
    if (filters?.sector) {
      totalEmpresasQb.where("em.sector = :sector", { sector: filters.sector });
    }
    const totalEmpresas = await totalEmpresasQb.getCount();

    const ofertasActivasQb = this.ofertaRepo
      .createQueryBuilder("o")
      .innerJoin("o.empresa", "empresa")
      .where("o.activa = :activa", { activa: true });
    if (filters?.sector) {
      ofertasActivasQb.andWhere("empresa.sector = :sector", {
        sector: filters.sector,
      });
    }
    if (filters?.from) {
      ofertasActivasQb.andWhere("o.fecha_publicacion >= :from", {
        from: filters.from,
      });
    }
    if (filters?.to) {
      ofertasActivasQb.andWhere("o.fecha_publicacion <= :to", {
        to: filters.to,
      });
    }
    const ofertasActivas = await ofertasActivasQb.getCount();

    const postulacionesHoy = await this.postulacionRepo.count({
      where: { fecha_postulacion: Between(inicioHoy, finHoy) },
    });
    const tasaEmpleabilidadQb = this.postulacionRepo
      .createQueryBuilder("p")
      .innerJoin("p.egresado", "egresado")
      .innerJoin("p.oferta", "oferta")
      .innerJoin("oferta.empresa", "empresa")
      .select("COUNT(DISTINCT egresado.id_egresado)", "contratados")
      .where("p.estado_actual = :est", { est: "contratado" });
    if (filters?.from) {
      tasaEmpleabilidadQb.andWhere("p.fecha_postulacion >= :from", {
        from: filters.from,
      });
    }
    if (filters?.to) {
      tasaEmpleabilidadQb.andWhere("p.fecha_postulacion <= :to", {
        to: filters.to,
      });
    }
    if (filters?.carrera) {
      tasaEmpleabilidadQb.andWhere("egresado.carrera = :carrera", {
        carrera: filters.carrera,
      });
    }
    if (filters?.sector) {
      tasaEmpleabilidadQb.andWhere("empresa.sector = :sector", {
        sector: filters.sector,
      });
    }
    const tasaEmpleabilidadRaw = await tasaEmpleabilidadQb.getRawOne();
    const contratados = parseInt(tasaEmpleabilidadRaw.contratados) || 0;
    const tasa = totalEgresados ? (contratados / totalEgresados) * 100 : 0;

    const empleabilidadPorCarreraQb = this.postulacionRepo
      .createQueryBuilder("p")
      .innerJoin("p.egresado", "egresado")
      .innerJoin("p.oferta", "oferta")
      .innerJoin("oferta.empresa", "empresa")
      .select("egresado.carrera", "carrera")
      .addSelect(
        "ROUND(100.0 * COUNT(DISTINCT CASE WHEN p.estado_actual = 'contratado' THEN egresado.id_egresado END) / NULLIF(COUNT(DISTINCT egresado.id_egresado), 0), 2)",
        "tasa_empleabilidad",
      )
      .groupBy("egresado.carrera")
      .orderBy("tasa_empleabilidad", "DESC");
    if (filters?.from) {
      empleabilidadPorCarreraQb.andWhere("p.fecha_postulacion >= :from", {
        from: filters.from,
      });
    }
    if (filters?.to) {
      empleabilidadPorCarreraQb.andWhere("p.fecha_postulacion <= :to", {
        to: filters.to,
      });
    }
    if (filters?.sector) {
      empleabilidadPorCarreraQb.andWhere("empresa.sector = :sector", {
        sector: filters.sector,
      });
    }
    if (filters?.carrera) {
      empleabilidadPorCarreraQb.andWhere("egresado.carrera = :carrera", {
        carrera: filters.carrera,
      });
    }
    const empleabilidadPorCarreraRaw =
      await empleabilidadPorCarreraQb.getRawMany();
    const empleabilidadPorCarrera = empleabilidadPorCarreraRaw.map((item) => ({
      carrera: item.carrera,
      tasa_empleabilidad: Number(item.tasa_empleabilidad) || 0,
    }));

    return {
      totalEgresados,
      totalEmpresas,
      ofertasActivas,
      postulacionesHoy,
      tasaEmpleabilidad: Number(tasa.toFixed(2)),
      empleabilidadPorCarrera,
    };
  }

  async getEgresadoKpi(egresadoId: number) {
    const postulaciones = await this.postulacionRepo.find({
      where: { egresado: { id_egresado: egresadoId } },
    });
    const activas = postulaciones.filter(
      (p) =>
        p.estado_actual !== "rechazado" && p.estado_actual !== "contratado",
    ).length;
    const entrevistas = postulaciones.filter(
      (p) => p.estado_actual === "entrevista",
    ).length;
    const contratadas = postulaciones.filter(
      (p) => p.estado_actual === "contratado",
    ).length;
    return {
      totalPostulaciones: postulaciones.length,
      activas,
      entrevistas,
      contratadas,
    };
  }

  async getOfertasRecomendadas(egresadoId: number) {
    const egresado = await this.egresadoRepo.findOne({
      where: { id_egresado: egresadoId },
      relations: ["habilidades"],
    });
    if (
      !egresado ||
      !egresado.habilidades ||
      egresado.habilidades.length === 0
    ) {
      return [];
    }

    const habilidadIds = egresado.habilidades.map((h) => h.id_habilidad);
    const ofertas = await this.ofertaRepo
      .createQueryBuilder("o")
      .innerJoin("o.habilidades", "h")
      .innerJoin("o.empresa", "empresa")
      .leftJoin("o.postulaciones", "p", "p.id_egresado = :egresadoId", {
        egresadoId,
      })
      .select("o")
      .addSelect("empresa")
      .addSelect("COUNT(DISTINCT h.id_habilidad)", "habilidades_match")
      .where("h.id_habilidad IN (:...habilidadIds)", { habilidadIds })
      .andWhere("o.activa = true")
      .andWhere("p.id_postulacion IS NULL")
      .groupBy("o.id_oferta")
      .addGroupBy("empresa.id_empresa")
      .orderBy("habilidades_match", "DESC")
      .addOrderBy("o.fecha_publicacion", "DESC")
      .limit(5)
      .getRawMany();

    const ofertasIds = ofertas.map((o) => o.o_id_oferta);
    if (ofertasIds.length === 0) return [];

    const ofertasCompletas = await this.ofertaRepo.find({
      where: { id_oferta: In(ofertasIds) },
      relations: ["empresa", "habilidades"],
    });

    return ofertasCompletas;
  }

  async getEmpresaKpi(empresaId: number) {
    const ofertas = await this.ofertaRepo.find({
      where: { empresa: { id_empresa: empresaId } },
    });
    const ofertasActivas = ofertas.filter((o) => o.activa).length;
    const postulaciones = await this.postulacionRepo
      .createQueryBuilder("p")
      .innerJoin("p.oferta", "o")
      .innerJoin("o.empresa", "emp")
      .where("emp.id_empresa = :eid", { eid: empresaId })
      .getMany();
    const totalPostulantes = postulaciones.length;
    const preseleccionados = postulaciones.filter(
      (p) => p.estado_actual === "preseleccionado",
    ).length;
    const contratados = postulaciones.filter(
      (p) => p.estado_actual === "contratado",
    ).length;

    // Últimas 5 ofertas con cantidad de postulaciones
    const ultimasOfertas = await this.ofertaRepo.find({
      where: { empresa: { id_empresa: empresaId } },
      relations: ["postulaciones"],
      order: { created_at: "DESC" },
      take: 5,
    });

    const listadoOfertas = ultimasOfertas.map((o) => ({
      id_oferta: o.id_oferta,
      titulo: o.titulo,
      postulaciones: o.postulaciones.length,
      activa: o.activa,
    }));

    return {
      ofertasActivas,
      totalOfertas: ofertas.length,
      totalPostulantes,
      preseleccionados,
      contratados,
      ultimasOfertas: listadoOfertas,
    };
  }

  async getTendenciasMensuales(
    rol: string,
    id?: number,
    filters?: DashboardFilters,
  ) {
    // Ejemplo simplificado: postulaciones por mes último año
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 12);
    let qb = this.postulacionRepo
      .createQueryBuilder("p")
      .innerJoin("p.oferta", "oferta")
      .innerJoin("oferta.empresa", "empresa")
      .innerJoin("p.egresado", "egresado")
      .select("DATE_TRUNC('month', p.fecha_postulacion) as mes")
      .addSelect("COUNT(*) as total")
      .where("p.fecha_postulacion >= :fecha", { fecha: fechaLimite })
      .groupBy("mes")
      .orderBy("mes");
    if (rol === "empresa" && id) {
      qb.andWhere("empresa.id_empresa = :eid", { eid: id });
    } else if (rol === "egresado" && id) {
      qb.andWhere("egresado.id_egresado = :eid", { eid: id });
    }

    if (filters?.from) {
      qb.andWhere("p.fecha_postulacion >= :from", { from: filters.from });
    }
    if (filters?.to) {
      qb.andWhere("p.fecha_postulacion <= :to", { to: filters.to });
    }
    if (filters?.carrera) {
      qb.andWhere("egresado.carrera = :carrera", { carrera: filters.carrera });
    }
    if (filters?.sector) {
      qb.andWhere("empresa.sector = :sector", { sector: filters.sector });
    }

    const rawData = await qb.getRawMany();

    // Mapear para asegurar formato correcto para el frontend
    return rawData.map((item) => ({
      mes: item.mes,
      total: parseInt(item.total) || 0,
    }));
  }

  async getRankingHabilidades(filters?: DashboardFilters) {
    // Consulta directa usando las tablas existentes
    const resultado = await this.ofertaRepo
      .createQueryBuilder("o")
      .innerJoin("o.empresa", "empresa")
      .leftJoin("o.postulaciones", "postulacion")
      .leftJoin("postulacion.egresado", "egresado")
      .select("h.nombre_habilidad", "nombre_habilidad")
      .addSelect("COUNT(DISTINCT o.id_oferta)", "cantidad_ofertas_requieren")
      .innerJoin("o.habilidades", "h")
      .where("o.activa = :activa", { activa: true })
      .andWhere(filters?.sector ? "empresa.sector = :sector" : "1=1", {
        sector: filters?.sector,
      })
      .andWhere(filters?.carrera ? "egresado.carrera = :carrera" : "1=1", {
        carrera: filters?.carrera,
      })
      .andWhere(filters?.from ? "o.fecha_publicacion >= :from" : "1=1", {
        from: filters?.from,
      })
      .andWhere(filters?.to ? "o.fecha_publicacion <= :to" : "1=1", {
        to: filters?.to,
      })
      .groupBy("h.id_habilidad")
      .addGroupBy("h.nombre_habilidad")
      .orderBy("cantidad_ofertas_requieren", "DESC")
      .limit(10)
      .getRawMany();

    return resultado.map((item) => ({
      nombre_habilidad: item.nombre_habilidad,
      cantidad_ofertas_requieren:
        parseInt(item.cantidad_ofertas_requieren) || 0,
    }));
  }
}
