import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { z } from 'zod';

@Injectable()
export class NotificacionesRouter {
  constructor(private trpc: TrpcService, private notificacionesService: NotificacionesService) {}

  router = this.trpc.router({
    listarTodas: this.trpc.procedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => this.notificacionesService.listarTodas(input.userId)),
    listarNoLeidas: this.trpc.procedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => this.notificacionesService.listarNoLeidas(input.userId)),
    marcarLeida: this.trpc.procedure
      .input(z.object({ notificacionId: z.number(), userId: z.number() }))
      .mutation(({ input }) => this.notificacionesService.marcarComoLeida(input.notificacionId, input.userId)),
  });
}
