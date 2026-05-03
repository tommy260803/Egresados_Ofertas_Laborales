import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { ReportesService } from '../../reportes/reportes.service';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const reporteTipoSchema = z.enum([
  'egresados_por_carrera',
  'ofertas_activas',
  'postulaciones_por_oferta',
  'empleabilidad_por_carrera',
  'habilidades_mas_demandadas',
]);
const reporteParametrosSchema = z.object({
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  carrera: z.string().optional(),
  sector: z.string().optional(),
  ofertaId: z.number().optional(),
});

@Injectable()
export class ReportesRouter {
  constructor(private trpc: TrpcService, private reportesService: ReportesService) {}

  router = this.trpc.router({
    // Estos endpoints se mantienen para compatibilidad de tipos si es necesario, 
    // pero la lógica principal ahora es vía REST directa en ReportesController
    misReportes: this.trpc.procedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      // Retornamos una lista vacía o el historial de la tabla reportes
      return [];
    }),
  });
}