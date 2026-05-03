import { IsEmail, IsString, MinLength, IsEnum, ValidateIf, IsOptional } from 'class-validator';

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

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  razon_social?: string;

  @ValidateIf(o => o.rol === 'empresa')
  @IsString()
  @IsOptional()
  ruc?: string;
}