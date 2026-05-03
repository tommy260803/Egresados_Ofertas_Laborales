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
    solicitar: this.trpc.procedure
      .input(z.object({ tipo: reporteTipoSchema, parametros: reporteParametrosSchema }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user || user.rol !== 'administrador') throw new TRPCError({ code: 'FORBIDDEN' });
        return this.reportesService.solicitarReporteAdmin(user as any, input.tipo, input.parametros);
      }),
    estado: this.trpc.procedure.input(z.number()).query(async ({ input, ctx }) => {
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return this.reportesService.obtenerEstado(input);
    }),
    misReportes: this.trpc.procedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return this.reportesService.listarReportes(user.userId);
    }),
  });
}