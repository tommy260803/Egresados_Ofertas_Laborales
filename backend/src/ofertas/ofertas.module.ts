import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfertasService } from './ofertas.service';
import { OfertasController } from './ofertas.controller';
import { HabilidadService } from './habilidad.service';
import { OfertaLaboral } from './entities/oferta-laboral.entity';
import { Empresa } from './entities/empresa.entity';
import { Postulacion } from './entities/postulacion.entity';
import { Habilidad } from './entities/habilidad.entity';
import { HistorialEstado } from './entities/historial-estado.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Egresado } from '../egresados/entities/egresado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfertaLaboral,
      Empresa,
      Postulacion,
      Habilidad,
      HistorialEstado,
      Usuario,
      Egresado,
    ]),
  ],
  providers: [OfertasService, HabilidadService],
  controllers: [OfertasController],
  exports: [OfertasService, HabilidadService],
})
export class OfertasModule {}