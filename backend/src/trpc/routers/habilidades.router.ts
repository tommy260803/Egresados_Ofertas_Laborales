import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { HabilidadService } from '../../ofertas/habilidad.service';
import { z } from 'zod';

@Injectable()
export class HabilidadesRouter {
  constructor(private trpc: TrpcService, private habilidadService: HabilidadService) {}

  router = this.trpc.router({
    listar: this.trpc.procedure
      .input(z.object({ search: z.string().optional(), categoria: z.string().optional() }).optional())
      .query(({ input }) => this.habilidadService.findAll(input)),
    crear: this.trpc.procedure
      .input(z.object({ nombre_habilidad: z.string(), categoria: z.string().optional() }))
      .mutation(({ input }) => this.habilidadService.create(input as any)),
    editar: this.trpc.procedure
      .input(z.object({ id: z.number(), data: z.object({ nombre_habilidad: z.string().optional(), categoria: z.string().optional() }) }))
      .mutation(({ input }) => this.habilidadService.update(input.id, input.data)),
    eliminar: this.trpc.procedure
      .input(z.number())
      .mutation(({ input }) => this.habilidadService.remove(input)),
  });
}
