import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export class PostularDto {
  @IsInt()
  id_oferta: number;

  @IsString()
  @IsOptional()
  mensaje?: string;

  @IsString()
  @IsOptional()
  cv_url?: string;
}

export class UpdatePostulacionEstadoDto {
  @IsEnum(['postulado','revisado','preseleccionado','entrevista','rechazado','contratado'])
  estado: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}