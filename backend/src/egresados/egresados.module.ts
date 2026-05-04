import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EgresadosService } from './egresados.service';
import { EgresadosController } from './egresados.controller';
import { Egresado } from './entities/egresado.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Habilidad } from '../ofertas/entities/habilidad.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Egresado, Usuario, Habilidad]),
    NotificacionesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [EgresadosService],
  controllers: [EgresadosController],
  exports: [EgresadosService],
})
export class EgresadosModule {}