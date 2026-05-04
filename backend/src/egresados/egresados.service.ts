import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Egresado } from './entities/egresado.entity';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';
import { Usuario } from '../auth/entities/usuario.entity';
import { Habilidad } from '../ofertas/entities/habilidad.entity';
import { EmailService } from '../notificaciones/email.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EgresadosService {
  constructor(
    @InjectRepository(Egresado)
    private egresadoRepo: Repository<Egresado>,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Habilidad)
    private habilidadRepo: Repository<Habilidad>,
    private emailService: EmailService,
    private jwtService: JwtService,
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
    const egresado = await this.egresadoRepo.findOne({ where: { id_egresado: usuarioId }, relations: ['habilidades', 'usuario'] });
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

  async invitar(dto: any) {
    const email = dto.email;
    if (!email) throw new BadRequestException('El email es obligatorio');

    const existingUser = await this.usuarioRepo.findOneBy({ email });
    if (existingUser) throw new BadRequestException('El email ya está registrado');

    // 1. Crear usuario inactivo y sin contraseña real
    const usuario = this.usuarioRepo.create({
      email,
      contrasena_hash: 'INVITACION_PENDIENTE', // Temporal
      rol: 'egresado',
      activo: false,
    });

    const token = this.jwtService.sign({ email });
    usuario.invitation_token = token;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    usuario.invitation_expires = expires;

    const savedUser = await this.usuarioRepo.save(usuario);

    // 2. Crear perfil de egresado con todos los datos del DTO
    const egresado = this.egresadoRepo.create({
      ...dto,
      id_egresado: savedUser.id_usuario,
      id_usuario: savedUser.id_usuario,
    });
    
    // Eliminar email del objeto de egresado ya que pertenece a usuario
    delete (egresado as any).email;

    await this.egresadoRepo.save(egresado);

    // 3. Enviar email
    const url = `http://localhost:3000/completar-registro?token=${token}`;
    await this.emailService.enviarCorreo(
      email,
      'Invitación al Sistema de Egresados',
      `<p>Hola ${dto.nombres || 'egresado'},</p>
       <p>Has sido invitado al sistema de egresados. Por favor completa tu registro estableciendo tu contraseña en el siguiente enlace:</p>
       <a href="${url}">${url}</a>
       <p>Este enlace expirará en 7 días.</p>`,
    );

    return { success: true };
  }

  async validarToken(token: string) {
    const usuario = await this.usuarioRepo.findOneBy({ invitation_token: token });
    if (!usuario) return { valido: false };

    if (usuario.invitation_expires < new Date()) {
      return { valido: false, mensaje: 'El token ha expirado' };
    }

    return { valido: true, email: usuario.email };
  }

  async completarRegistro(token: string, contrasena: string) {
    const usuario = await this.usuarioRepo.findOneBy({ invitation_token: token });
    if (!usuario || usuario.invitation_expires < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const salt = await bcrypt.genSalt();
    usuario.contrasena_hash = await bcrypt.hash(contrasena, salt);
    usuario.activo = true;
    usuario.invitation_token = null;
    usuario.invitation_expires = null;

    await this.usuarioRepo.save(usuario);
    return { success: true };
  }
}