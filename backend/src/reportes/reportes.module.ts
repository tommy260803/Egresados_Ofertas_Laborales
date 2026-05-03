import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Reporte } from './entities/reporte.entity';
import { PdfGeneratorService } from './puppeteer/pdf-generator.service';
import { Egresado } from '../egresados/entities/egresado.entity';
import { OfertaLaboral } from '../ofertas/entities/oferta-laboral.entity';
import { Postulacion } from '../ofertas/entities/postulacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte, Egresado, OfertaLaboral, Postulacion]),
  ],
  providers: [ReportesService, PdfGeneratorService],
  controllers: [ReportesController],
  exports: [ReportesService],
})
export class ReportesModule {}