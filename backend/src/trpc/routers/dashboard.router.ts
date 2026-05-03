import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

@Injectable()
export class DashboardRouter {
  constructor(private trpc: TrpcService, private dashboardService: DashboardService) {}

  private readonly dashboardFiltersInput = z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    carrera: z.string().optional(),
    sector: z.string().optional(),
  }).optional();

  private parseFilters(input?: { from?: string; to?: string; carrera?: string; sector?: string }) {
    return {
      from: input?.from ? new Date(input.from) : undefined,
      to: input?.to ? new Date(input.to) : undefined,
      carrera: input?.carrera,
      sector: input?.sector,
    };
  }

  router = this.trpc.router({
    adminKpis: this.trpc.procedure.input(this.dashboardFiltersInput).query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user || user.rol !== 'administrador') throw new TRPCError({ code: 'FORBIDDEN' });
      return this.dashboardService.getAdminKpis(this.parseFilters(input));
    }),
    egresadoKpis: this.trpc.procedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user || user.rol !== 'egresado') throw new TRPCError({ code: 'FORBIDDEN' });
      return this.dashboardService.getEgresadoKpi(user.userId);
    }),
    empresaKpis: this.trpc.procedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user || user.rol !== 'empresa') throw new TRPCError({ code: 'FORBIDDEN' });
      return this.dashboardService.getEmpresaKpi(user.userId);
    }),
    tendencias: this.trpc.procedure.input(this.dashboardFiltersInput).query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      const filters = this.parseFilters(input);
      if (user.rol === 'administrador') return this.dashboardService.getTendenciasMensuales('admin', undefined, filters);
      if (user.rol === 'egresado') return this.dashboardService.getTendenciasMensuales('egresado', user.userId, filters);
      if (user.rol === 'empresa') return this.dashboardService.getTendenciasMensuales('empresa', user.userId, filters);
      throw new TRPCError({ code: 'FORBIDDEN' });
    }),
    topHabilidades: this.trpc.procedure.input(this.dashboardFiltersInput).query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user || !['administrador', 'empresa'].includes(user.rol)) throw new TRPCError({ code: 'FORBIDDEN' });
      return this.dashboardService.getRankingHabilidades(this.parseFilters(input));
    }),
    ofertasRecomendadas: this.trpc.procedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user || user.rol !== 'egresado') throw new TRPCError({ code: 'FORBIDDEN' });
      return this.dashboardService.getOfertasRecomendadas(user.userId);
    }),
  });
}