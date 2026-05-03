import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { OfertasService } from '../../ofertas/ofertas.service';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

@Injectable()
export class OfertasRouter {
  constructor(private trpc: TrpcService, private ofertasService: OfertasService) {}

  router = this.trpc.router({
    list: this.trpc.procedure
      .input(z.object({ titulo: z.string().optional(), modalidad: z.string().optional(), ubicacion: z.string().optional(), salario_min: z.number().optional(), salario_max: z.number().optional(), habilidad: z.number().optional() }).optional())
      .query(async ({ input }) => this.ofertasService.findAll(input)),
    byId: this.trpc.procedure.input(z.number()).query(async ({ input }) => this.ofertasService.findOne(input)),
    create: this.trpc.procedure
      .input(z.any())
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'empresa') throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.ofertasService.create(user.userId, input);
      }),
    update: this.trpc.procedure
      .input(z.object({ id: z.number(), data: z.any() }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (user.rol !== 'empresa') throw new TRPCError({ code: 'FORBIDDEN' });
        return this.ofertasService.update(input.id, user.userId, input.data);
      }),
    delete: this.trpc.procedure.input(z.number()).mutation(async ({ input, ctx }) => {
      const user = (ctx as any).user;
      if (user.rol !== 'empresa') throw new TRPCError({ code: 'FORBIDDEN' });
      await this.ofertasService.remove(input, user.userId);
      return { success: true };
    }),
    misOfertas: this.trpc.procedure
      .input(z.object({ titulo: z.string().optional(), activa: z.any().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'empresa') throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.ofertasService.listarOfertasPorEmpresa(user.userId, input);
      }),
    alternarEstado: this.trpc.procedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'empresa') throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.ofertasService.alternarEstadoOferta(input, user.userId);
      }),
    postular: this.trpc.procedure
      .input(z.object({ id_oferta: z.number(), mensaje: z.string().optional(), cv_url: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'egresado') throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.ofertasService.postular(user.userId, input as any);
      }),
    cambiarEstadoPostulacion: this.trpc.procedure
      .input(z.object({ postulacionId: z.number(), estado: z.enum(['postulado','revisado','preseleccionado','entrevista','rechazado','contratado']), motivo: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'empresa') throw new TRPCError({ code: 'FORBIDDEN' });
        return this.ofertasService.cambiarEstadoPostulacion(input.postulacionId, user.userId, { estado: input.estado, motivo: input.motivo });
      }),
    listarPostulacionesPorOferta: this.trpc.procedure
      .input(z.object({ ofertaId: z.number() }))
      .query(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'empresa') throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.ofertasService.listarPostulacionesPorOferta(input.ofertaId, user.userId);
      }),
    listarPostulacionesEmpresa: this.trpc.procedure
      .query(async ({ ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'empresa') throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.ofertasService.listarPostulacionesPorEmpresa(user.userId);
      }),
    misPostulaciones: this.trpc.procedure
      .query(async ({ ctx }) => {
        const user = (ctx as any).user;
        if (!user || user.rol !== 'egresado') throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.ofertasService.listarPostulacionesPorEgresado(user.userId);
      }),
    historialPostulacion: this.trpc.procedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        const user = (ctx as any).user;
        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        if (user.rol === 'egresado') {
          return this.ofertasService.obtenerHistorialPostulacion(input, user.userId);
        } else if (user.rol === 'empresa') {
          return this.ofertasService.obtenerHistorialPostulacionEmpresa(input, user.userId);
        }
        
        throw new TRPCError({ code: 'FORBIDDEN' });
      }),
  });
}