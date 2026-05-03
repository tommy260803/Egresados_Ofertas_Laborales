import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { AuthModule } from '../auth/auth.module';
import { EgresadosModule } from '../egresados/egresados.module';
import { OfertasModule } from '../ofertas/ofertas.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ReportesModule } from '../reportes/reportes.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { AuthRouter } from './routers/auth.router';
import { EgresadosRouter } from './routers/egresados.router';
import { OfertasRouter } from './routers/ofertas.router';
import { DashboardRouter } from './routers/dashboard.router';
import { ReportesRouter } from './routers/reportes.router';
import { HabilidadesRouter } from './routers/habilidades.router';
import { NotificacionesRouter } from './routers/notificaciones.router';

@Module({
  imports: [AuthModule, EgresadosModule, OfertasModule, DashboardModule, ReportesModule, NotificacionesModule],
  providers: [
    TrpcService,
    TrpcRouter,
    AuthRouter,
    EgresadosRouter,
    OfertasRouter,
    DashboardRouter,
    ReportesRouter,
    HabilidadesRouter,
    NotificacionesRouter,
  ],
  exports: [TrpcService],
})
export class TrpcModule {}