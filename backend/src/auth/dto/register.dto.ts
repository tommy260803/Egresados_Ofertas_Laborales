import { IsEmail, IsString, MinLength, IsEnum, ValidateIf, IsOptional, IsInt } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsEnum(['egresado', 'empresa'])
  rol: string;

  // Campos específicos según rol
  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  nombres?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  apellidos?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  carrera?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  @IsOptional()
  documento_identidad?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  @IsOptional()
  telefono?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  @IsOptional()
  ciudad?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  @IsOptional()
  universidad?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsInt()
  @IsOptional()
  anio_graduacion?: number;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  @IsOptional()
  perfil_laboral?: string;

  @ValidateIf(o => o.rol === 'egresado')
  @IsString()
  @IsOptional()
  direccion?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  razon_social?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  ruc?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  sector?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  ciudad_empresa?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  sitio_web?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  telefono_contacto?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  direccion_empresa?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  descripcion_empresa?: string;
}