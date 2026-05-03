import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Egresado } from '../egresados/entities/egresado.entity';
import { Empresa } from '../ofertas/entities/empresa.entity';
import { OfertaLaboral } from '../ofertas/entities/oferta-laboral.entity';
import { Postulacion } from '../ofertas/entities/postulacion.entity';
import { Habilidad } from '../ofertas/entities/habilidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Egresado, Empresa, OfertaLaboral, Postulacion, Habilidad])],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}