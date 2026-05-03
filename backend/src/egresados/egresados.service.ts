import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Egresado } from './entities/egresado.entity';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';
import { Usuario } from '../auth/entities/usuario.entity';
import { Habilidad } from '../ofertas/entities/habilidad.entity';

@Injectable()
export class EgresadosService {
  constructor(
    @InjectRepository(Egresado)
    private egresadoRepo: Repository<Egresado>,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Habilidad)
    private habilidadRepo: Repository<Habilidad>,
  ) {}

  async create(userId: number, dto: CreateEgresadoDto): Promise<Egresado> {
    const usuario = await this.usuarioRepo.findOneBy({ id_usuario: userId });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const egresado = this.egresadoRepo.create({ id_egresado: userId, ...dto });
    return this.egresadoRepo.save(egresado);
  }

  async findAll(filters?: Record<string, unknown>): Promise<Egresado[]> {
    const qb = this.egresadoRepo.createQueryBuilder('e')
      .leftJoinAndSelect('e.habilidades', 'h')
      .leftJoinAndSelect('e.usuario', 'u');
    if (filters?.search) {
      qb.andWhere('(e.nombres ILIKE :search OR e.apellidos ILIKE :search OR u.email ILIKE :search)', { search: `%${filters.search as string}%` });
    }
    if (filters?.carrera) qb.andWhere('e.carrera ILIKE :carrera', { carrera: `%${filters.carrera as string}%` });
    if (filters?.ciudad) qb.andWhere('e.ciudad = :ciudad', { ciudad: filters.ciudad as string });
    if (filters?.habilidad) {
      qb.innerJoin('e.habilidades', 'hf').andWhere('hf.id_habilidad = :hid', { hid: filters.habilidad as number });
    }
    return qb.getMany();
  }

  async findOne(id: number): Promise<Egresado> {
    const egresado = await this.egresadoRepo.findOne({ where: { id_egresado: id }, relations: ['habilidades', 'usuario'] });
    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    return egresado;
  }

  async findOneByUsuarioId(usuarioId: number): Promise<Egresado> {
    const egresado = await this.egresadoRepo.findOne({ where: { id_usuario: usuarioId }, relations: ['habilidades', 'usuario'] });
    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    return egresado;
  }

  async update(id: number, dto: UpdateEgresadoDto): Promise<Egresado> {
    await this.findOne(id);
    await this.egresadoRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.egresadoRepo.delete(id);
    await this.usuarioRepo.update(id, { activo: false });
  }

  async getHabilidades(id: number): Promise<Habilidad[]> {
    const egresado = await this.egresadoRepo.findOne({ where: { id_egresado: id }, relations: ['habilidades'] });
    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    return egresado.habilidades;
  }

  async addHabilidad(egresadoId: number, habilidadId: number): Promise<Egresado> {
    const egresado = await this.egresadoRepo.findOne({ where: { id_egresado: egresadoId }, relations: ['habilidades'] });
    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    const habilidad = await this.habilidadRepo.findOneBy({ id_habilidad: habilidadId });
    if (!habilidad) throw new NotFoundException('Habilidad no encontrada');
    if (!egresado.habilidades) egresado.habilidades = [];
    if (!egresado.habilidades.some((h: Habilidad) => h.id_habilidad === habilidadId)) {
      egresado.habilidades.push(habilidad);
      await this.egresadoRepo.save(egresado);
    }
    return this.findOne(egresadoId);
  }

  async removeHabilidad(egresadoId: number, habilidadId: number): Promise<Egresado> {
    const egresado = await this.egresadoRepo.findOne({ where: { id_egresado: egresadoId }, relations: ['habilidades'] });
    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    egresado.habilidades = egresado.habilidades.filter((h: Habilidad) => h.id_habilidad !== habilidadId);
    await this.egresadoRepo.save(egresado);
    return this.findOne(egresadoId);
  }
}