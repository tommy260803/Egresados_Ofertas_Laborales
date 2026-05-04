import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { EmailService } from './email.service';
import { Notificacion } from './entities/notificacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion])],
  providers: [NotificacionesService, EmailService],
  controllers: [NotificacionesController],
  exports: [NotificacionesService, EmailService],
})
export class NotificacionesModule {}