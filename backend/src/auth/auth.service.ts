import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { Usuario } from "./entities/usuario.entity";
import { Egresado } from "../egresados/entities/egresado.entity";
import { Empresa } from "../ofertas/entities/empresa.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Egresado)
    private egresadoRepo: Repository<Egresado>,
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usuarioRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException("Email ya registrado");

    const hashed = await bcrypt.hash(dto.contrasena, 10);
    const usuario = this.usuarioRepo.create({
      email: dto.email,
      contrasena_hash: hashed,
      rol: dto.rol as Usuario["rol"],
    });
    await this.usuarioRepo.save(usuario);

    await this.createProfile(usuario, dto);
    const tokens = this.generateTokens(usuario);
    return {
      user: { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
      ...tokens,
    };
  }

  private async createProfile(usuario: Usuario, dto: RegisterDto) {
    if (dto.rol === "egresado") {
      const egresado = this.egresadoRepo.create({
        id_egresado: usuario.id_usuario,
        nombres: dto.nombres || "",
        apellidos: dto.apellidos || "",
        carrera: dto.carrera || "",
        documento_identidad: dto.documento_identidad,
        telefono: dto.telefono,
        ciudad: dto.ciudad,
        universidad: dto.universidad,
        anio_graduacion: dto.anio_graduacion,
        perfil_laboral: dto.perfil_laboral,
        direccion: dto.direccion,
      });
      await this.egresadoRepo.save(egresado);
    } else if (dto.rol === "empresa") {
      const empresa = this.empresaRepo.create({
        id_empresa: usuario.id_usuario,
        razon_social: dto.razon_social || "",
        ruc: dto.ruc,
        sector: dto.sector,
        ciudad: dto.ciudad_empresa,
        sitio_web: dto.sitio_web,
        telefono_contacto: dto.telefono_contacto,
        direccion: dto.direccion_empresa,
        descripcion: dto.descripcion_empresa,
      });
      await this.empresaRepo.save(empresa);
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usuarioRepo.findOneBy({ email: dto.email });
    if (
      !user ||
      !(await bcrypt.compare(dto.contrasena, user.contrasena_hash))
    ) {
      throw new UnauthorizedException("Credenciales inválidas");
    }
    const tokens = this.generateTokens(user);
    return {
      user: { id: user.id_usuario, email: user.email, rol: user.rol },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
      });
      const user = await this.usuarioRepo.findOneBy({
        id_usuario: payload.sub,
      });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }
  }

  private generateTokens(user: Usuario) {
    const payload = { email: user.email, sub: user.id_usuario, rol: user.rol };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get("JWT_REFRESH_EXPIRES_IN") || "7d",
    });
    return { accessToken, refreshToken };
  }
}
