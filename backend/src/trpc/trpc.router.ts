import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthRouter } from './routers/auth.router';
import { EgresadosRouter } from './routers/egresados.router';
import { OfertasRouter } from './routers/ofertas.router';
import { DashboardRouter } from './routers/dashboard.router';
import { ReportesRouter } from './routers/reportes.router';
import { HabilidadesRouter } from './routers/habilidades.router';
import { NotificacionesRouter } from './routers/notificaciones.router';
import * as trpcExpress from '@trpc/server/adapters/express';

@Injectable()
export class TrpcRouter {
  constructor(
    private trpc: TrpcService,
    private authRouter: AuthRouter,
    private egresadosRouter: EgresadosRouter,
    private ofertasRouter: OfertasRouter,
    private dashboardRouter: DashboardRouter,
    private reportesRouter: ReportesRouter,
    private habilidadesRouter: HabilidadesRouter,
    private notificacionesRouter: NotificacionesRouter,
  ) {}

  appRouter = this.trpc.router({
    auth: this.authRouter.router,
    egresados: this.egresadosRouter.router,
    ofertas: this.ofertasRouter.router,
    dashboard: this.dashboardRouter.router,
    reportes: this.reportesRouter.router,
    habilidades: this.habilidadesRouter.router,
    notificaciones: this.notificacionesRouter.router,
  });

  get handlers() {
    return trpcExpress.createExpressMiddleware({
      router: this.appRouter,
      createContext: this.trpc.createContext,
    });
  }
}