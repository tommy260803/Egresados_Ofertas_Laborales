import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { EgresadosService } from '../../egresados/egresados.service';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const createEgresadoSchema = z.object({
  email: z.string().email(),
  nombres: z.string(),
  apellidos: z.string(),
  documento_identidad: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  carrera: z.string(),
  universidad: z.string().optional(),
  anio_graduacion: z.number().min(1950).max(new Date().getFullYear()).optional(),
  perfil_laboral: z.string().optional(),
  cv_url: z.string().url().or(z.literal("")).optional().nullable(),
  habilidadesIds: z.array(z.number()).optional(),
});

const updateEgresadoSchema = createEgresadoSchema.partial();

@Injectable()
export class EgresadosRouter {
  constructor(private trpc: TrpcService, private egresadosService: EgresadosService) {}

  router = this.trpc.router({
    list: this.trpc.procedure
      .input(z.object({ search: z.string().optional(), carrera: z.string().optional(), ciudad: z.string().optional(), habilidad: z.number().optional() }).optional())
      .query(async ({ input }) => this.egresadosService.findAll(input)),
    byId: this.trpc.procedure.input(z.number()).query(async ({ input }) => this.egresadosService.findOne(input)),
    byUsuarioId: this.trpc.procedure.input(z.number()).query(async ({ input }) => this.egresadosService.findOneByUsuarioId(input)),
    create: this.trpc.procedure
      .input(createEgresadoSchema)
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        return this.egresadosService.create(user.userId, input as any);
      }),
    update: this.trpc.procedure
      .input(z.object({ id: z.number(), data: updateEgresadoSchema }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        if (user.rol !== 'administrador' && user.userId !== input.id) throw new TRPCError({ code: 'FORBIDDEN' });
        return this.egresadosService.update(input.id, input.data);
      }),
    remove: this.trpc.procedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        if (user.rol !== 'administrador' && user.userId !== input) throw new TRPCError({ code: 'FORBIDDEN' });
        await this.egresadosService.remove(input);
        return { success: true };
      }),

    habilidades: this.trpc.procedure
  .input(z.object({ egresadoId: z.number() }))
  .query(async ({ input }) => {
    return this.egresadosService.getHabilidades(input.egresadoId);
  }),
agregarHabilidad: this.trpc.procedure
  .input(z.object({ egresadoId: z.number(), habilidadId: z.number() }))
  .mutation(async ({ input, ctx }) => {
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (user.userId !== input.egresadoId && user.rol !== 'administrador') throw new TRPCError({ code: 'FORBIDDEN' });
    return this.egresadosService.addHabilidad(input.egresadoId, input.habilidadId);
  }),
eliminarHabilidad: this.trpc.procedure
  .input(z.object({ egresadoId: z.number(), habilidadId: z.number() }))
  .mutation(async ({ input, ctx }) => {
    const user = ctx.user;
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (user.userId !== input.egresadoId && user.rol !== 'administrador') throw new TRPCError({ code: 'FORBIDDEN' });
    return this.egresadosService.removeHabilidad(input.egresadoId, input.habilidadId);
  }),

invitar: this.trpc.procedure
  .input(createEgresadoSchema)
  .mutation(async ({ input, ctx }) => {
    const user = ctx.user;
    if (!user || user.rol !== 'administrador') throw new TRPCError({ code: 'UNAUTHORIZED' });
    return this.egresadosService.invitar(input);
  }),

validarToken: this.trpc.procedure
  .input(z.object({ token: z.string() }))
  .query(async ({ input }) => {
    return this.egresadosService.validarToken(input.token);
  }),

completarRegistro: this.trpc.procedure
  .input(z.object({
    token: z.string(),
    contrasena: z.string().min(6),
  }))
  .mutation(async ({ input }) => {
    return this.egresadosService.completarRegistro(input.token, input.contrasena);
  }),

  });
}