import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsArray, IsDateString, IsPositive } from 'class-validator';

export class CreateOfertaDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsEnum(['presencial', 'remoto', 'hibrido'])
  modalidad: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salario_minimo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salario_maximo?: number;

  @IsString()
  @IsOptional()
  tipo_salario?: string;

  @IsString()
  @IsOptional()
  jornada?: string;

  @IsString()
  @IsOptional()
  experiencia_requerida?: string;

  @IsDateString()
  @IsOptional()
  fecha_cierre?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  habilidadesIds?: number[];
}