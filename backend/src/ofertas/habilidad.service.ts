import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Habilidad } from "./entities/habilidad.entity";

@Injectable()
export class HabilidadService {
  constructor(
    @InjectRepository(Habilidad)
    private habilidadRepo: Repository<Habilidad>,
  ) {}

  async findAll(filters?: {
    search?: string;
    categoria?: string;
  }): Promise<Habilidad[]> {
    const qb = this.habilidadRepo.createQueryBuilder("h");
    if (filters?.search) {
      qb.andWhere(
        "(h.nombre_habilidad ILIKE :search OR h.categoria ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }
    if (filters?.categoria) {
      qb.andWhere("h.categoria ILIKE :categoria", {
        categoria: `%${filters.categoria}%`,
      });
    }
    qb.orderBy("h.id_habilidad", "ASC");
    return qb.getMany();
  }

  async create(dto: {
    nombre_habilidad: string;
    categoria?: string;
  }): Promise<Habilidad> {
    const habilidad = this.habilidadRepo.create(dto);
    return this.habilidadRepo.save(habilidad);
  }

  async remove(id: number): Promise<void> {
    const habilidad = await this.habilidadRepo.findOneBy({ id_habilidad: id });
    if (!habilidad) throw new NotFoundException("Habilidad no encontrada");
    await this.habilidadRepo.delete(id);
  }

  async update(
    id: number,
    dto: { nombre_habilidad?: string; categoria?: string },
  ): Promise<Habilidad> {
    const habilidad = await this.habilidadRepo.findOneBy({ id_habilidad: id });
    if (!habilidad) throw new NotFoundException("Habilidad no encontrada");
    await this.habilidadRepo.update(id, dto);
    const updated = await this.habilidadRepo.findOneBy({ id_habilidad: id });
    if (!updated) throw new NotFoundException("Habilidad no encontrada");
    return updated;
  }
}
