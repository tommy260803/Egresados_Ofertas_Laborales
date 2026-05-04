import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, Like, In } from "typeorm";
import { OfertaLaboral } from "./entities/oferta-laboral.entity";
import { Empresa } from "./entities/empresa.entity";
import { Postulacion } from "./entities/postulacion.entity";
import { Habilidad } from "./entities/habilidad.entity";
import { Egresado } from "../egresados/entities/egresado.entity";
import { CreateOfertaDto } from "./dto/create-oferta.dto";
import { UpdateOfertaDto } from "./dto/update-oferta.dto";
import { PostularDto, UpdatePostulacionEstadoDto } from "./dto/postulacion.dto";

import { HistorialEstado } from "./entities/historial-estado.entity";

@Injectable()
export class OfertasService {
  constructor(
    @InjectRepository(OfertaLaboral)
    private ofertaRepo: Repository<OfertaLaboral>,
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
    @InjectRepository(Postulacion)
    private postulacionRepo: Repository<Postulacion>,
    @InjectRepository(Egresado)
    private egresadoRepo: Repository<Egresado>,
    @InjectRepository(HistorialEstado)
    private historialRepo: Repository<HistorialEstado>,
    @InjectRepository(Habilidad)
    private habilidadRepo: Repository<Habilidad>,
  ) {}

  async create(empresaId: number, dto: any): Promise<OfertaLaboral> {
    const empresa = await this.empresaRepo.findOneBy({ id_empresa: empresaId });
    if (!empresa) throw new NotFoundException("Empresa no encontrada");

    const { habilidadesIds, ...ofertaData } = dto;
    const oferta = this.ofertaRepo.create({
      ...ofertaData,
      empresa,
    } as any) as unknown as OfertaLaboral;

    if (habilidadesIds && habilidadesIds.length > 0) {
      const habilidades = await this.habilidadRepo.find({
        where: { id_habilidad: In(habilidadesIds) },
      });
      oferta.habilidades = habilidades;
    }

    return this.ofertaRepo.save(oferta);
  }

  async findAll(filters?: Record<string, unknown>): Promise<OfertaLaboral[]> {
    const qb = this.ofertaRepo
      .createQueryBuilder("o")
      .leftJoinAndSelect("o.empresa", "e")
      .leftJoinAndSelect("o.habilidades", "h")
      .where("o.activa = true");
    if (filters?.titulo)
      qb.andWhere("o.titulo ILIKE :tit", {
        tit: `%${filters.titulo as string}%`,
      });
    if (filters?.modalidad && filters.modalidad !== "todas") {
      // Normalizar modalidad para la consulta: quitar tildes y minúsculas
      const mod = (filters.modalidad as string)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      qb.andWhere("o.modalidad = :mod", { mod });
    }
    if (filters?.ubicacion)
      qb.andWhere("o.ubicacion ILIKE :ubi", {
        ubi: `%${filters.ubicacion as string}%`,
      });
    if (filters?.salario_min)
      qb.andWhere("o.salario_maximo >= :min", {
        min: filters.salario_min as number,
      });
    if (filters?.salario_max)
      qb.andWhere("o.salario_minimo <= :max", {
        max: filters.salario_max as number,
      });
    if (filters?.habilidad) {
      qb.innerJoin("o.habilidades", "hf").andWhere("hf.id_habilidad = :hid", {
        hid: filters.habilidad as number,
      });
    }
    return qb.getMany();
  }

  async findOne(id: number): Promise<OfertaLaboral> {
    const oferta = await this.ofertaRepo.findOne({
      where: { id_oferta: id },
      relations: ["empresa", "habilidades"],
    });
    if (!oferta) throw new NotFoundException("Oferta no encontrada");
    return oferta;
  }

  async update(
    id: number,
    empresaId: number,
    dto: UpdateOfertaDto,
  ): Promise<OfertaLaboral> {
    const oferta = await this.findOne(id);
    if (oferta.empresa.id_empresa !== empresaId)
      throw new ForbiddenException("No es tu oferta");
    await this.ofertaRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number, empresaId: number): Promise<void> {
    const oferta = await this.findOne(id);
    if (oferta.empresa.id_empresa !== empresaId) throw new ForbiddenException();
    
    // Validar que no tenga postulaciones
    const count = await this.postulacionRepo.count({ where: { oferta: { id_oferta: id } } });
    if (count > 0) {
      throw new ForbiddenException('No se puede eliminar una oferta que ya tiene postulaciones. Intente cerrarla en su lugar.');
    }
    
    await this.ofertaRepo.delete(id);
  }

  async postular(egresadoId: number, dto: PostularDto): Promise<Postulacion> {
    const oferta = await this.findOne(dto.id_oferta);
    if (!oferta.activa) throw new ForbiddenException("Oferta cerrada");
    const existente = await this.postulacionRepo.findOne({
      where: {
        oferta: { id_oferta: dto.id_oferta },
        egresado: { id_egresado: egresadoId },
      },
    });
    if (existente) throw new ForbiddenException("Ya postulaste");
    const egresado = await this.egresadoRepo.findOneBy({
      id_egresado: egresadoId,
    });
    if (!egresado) throw new NotFoundException("Egresado no encontrado");
    const postulacion = this.postulacionRepo.create({
      oferta,
      egresado,
      mensaje: dto.mensaje,
      cv_postulacion_url: dto.cv_url,
    } as any) as unknown as Postulacion;
    return this.postulacionRepo.save(postulacion);
  }

  async cambiarEstadoPostulacion(
    postulacionId: number,
    empresaId: number,
    dto: UpdatePostulacionEstadoDto,
  ): Promise<Postulacion> {
    const postulacion = await this.postulacionRepo.findOne({
      where: { id_postulacion: postulacionId },
      relations: ["oferta", "oferta.empresa"],
    });
    if (!postulacion) throw new NotFoundException();
    if (postulacion.oferta.empresa.id_empresa !== empresaId)
      throw new ForbiddenException();
    postulacion.estado_actual = dto.estado;
    // El trigger en BD guardará historial automáticamente
    return this.postulacionRepo.save(postulacion);
  }

  async listarPostulacionesPorEgresado(
    egresadoId: number,
  ): Promise<Postulacion[]> {
    return this.postulacionRepo.find({
      where: { egresado: { id_egresado: egresadoId } },
      relations: ["oferta", "oferta.empresa"],
      order: { fecha_postulacion: "DESC" },
    });
  }

  async listarPostulacionesPorEmpresa(
    empresaId: number,
  ): Promise<Postulacion[]> {
    return this.postulacionRepo.find({
      where: { oferta: { empresa: { id_empresa: empresaId } } },
      relations: ["egresado", "oferta", "egresado.usuario"],
      order: { fecha_postulacion: "DESC" },
    });
  }

  async listarPostulacionesPorOferta(
    ofertaId: number,
    empresaId: number,
  ): Promise<Postulacion[]> {
    const oferta = await this.findOne(ofertaId);
    if (oferta.empresa.id_empresa !== empresaId) throw new ForbiddenException();
    return this.postulacionRepo.find({
      where: { oferta: { id_oferta: ofertaId } },
      relations: ["egresado"],
    });
  }

  async listarOfertasPorEmpresa(
    empresaId: number,
    filters?: Record<string, any>,
  ): Promise<any[]> {
    const qb = this.ofertaRepo
      .createQueryBuilder("o")
      .loadRelationCountAndMap("o.total_postulaciones", "o.postulaciones")
      .innerJoin("o.empresa", "emp")
      .where("emp.id_empresa = :eid", { eid: empresaId });

    if (filters?.titulo) {
      qb.andWhere("o.titulo ILIKE :tit", { tit: `%${filters.titulo}%` });
    }
    if (filters?.activa !== undefined && filters.activa !== null) {
      qb.andWhere("o.activa = :act", {
        act: filters.activa === "true" || filters.activa === true,
      });
    }

    qb.orderBy("o.created_at", "DESC");
    return qb.getMany();
  }

  async alternarEstadoOferta(
    id: number,
    empresaId: number,
  ): Promise<OfertaLaboral> {
    const oferta = await this.findOne(id);
    if (oferta.empresa.id_empresa !== empresaId) throw new ForbiddenException();
    oferta.activa = !oferta.activa;
    return this.ofertaRepo.save(oferta);
  }

  async obtenerHistorialPostulacion(
    postulacionId: number,
    egresadoId: number,
  ): Promise<HistorialEstado[]> {
    const postulacion = await this.postulacionRepo.findOne({
      where: {
        id_postulacion: postulacionId,
        egresado: { id_egresado: egresadoId },
      },
    });
    if (!postulacion) throw new NotFoundException("Postulación no encontrada");

    return this.historialRepo.find({
      where: { postulacion: { id_postulacion: postulacionId } },
      order: { fecha_cambio: "DESC" },
    });
  }

  async obtenerHistorialPostulacionEmpresa(
    postulacionId: number,
    empresaId: number,
  ): Promise<HistorialEstado[]> {
    const postulacion = await this.postulacionRepo.findOne({
      where: {
        id_postulacion: postulacionId,
        oferta: { empresa: { id_empresa: empresaId } },
      },
    });
    if (!postulacion) throw new NotFoundException("Postulación no encontrada");

    return this.historialRepo.find({
      where: { postulacion: { id_postulacion: postulacionId } },
      order: { fecha_cambio: "DESC" },
    });
  }
}
