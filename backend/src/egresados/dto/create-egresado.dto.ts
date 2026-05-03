import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsArray, IsEnum, IsEmail } from 'class-validator';

export class CreateEgresadoDto {
  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  @IsOptional()
  documento_identidad?: string;

  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  ciudad?: string;

  @IsString()
  carrera: string;

  @IsString()
  @IsOptional()
  universidad?: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  @IsOptional()
  anio_graduacion?: number;

  @IsString()
  @IsOptional()
  perfil_laboral?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  habilidadesIds?: number[];
}