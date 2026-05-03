import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EgresadosModule } from './egresados/egresados.module';
import { OfertasModule } from './ofertas/ofertas.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportesModule } from './reportes/reportes.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { TrpcModule } from './trpc/trpc.module';
import { JwtMiddleware } from './common/middlewares/jwt.middleware';
import { CvModule } from './cv/cv.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
    DatabaseModule,
    AuthModule,
    EgresadosModule,
    OfertasModule,
    DashboardModule,
    ReportesModule,
    NotificacionesModule,
    TrpcModule,
    CvModule,
  ],
  providers: [JwtMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes('trpc');
  }
}