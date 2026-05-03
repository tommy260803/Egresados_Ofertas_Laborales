import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { EmailService } from './email.service';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepo: Repository<Notificacion>,
    private emailService: EmailService,
  ) {}

  async crearNotificacionInterna(destinatarioId: number, tipo: string, asunto: string, contenido: string, metadata?: Record<string, unknown>, idReferencia?: number): Promise<Notificacion> {
    const notif = this.notificacionRepo.create({
      id_usuario_destinatario: { id_usuario: destinatarioId },
      tipo,
      asunto,
      contenido,
      metadata,
      id_referencia: idReferencia,
    });
    return this.notificacionRepo.save(notif);
  }

  async enviarNotificacionEmail(destinatarioEmail: string, asunto: string, contenidoHtml: string): Promise<void> {
    await this.emailService.enviarCorreo(destinatarioEmail, asunto, contenidoHtml);
  }

  async marcarComoLeida(notificacionId: number, usuarioId: number): Promise<void> {
    await this.notificacionRepo.update({ id_notificacion: notificacionId, id_usuario_destinatario: { id_usuario: usuarioId } }, { leida: true });
  }

  async listarNoLeidas(usuarioId: number): Promise<Notificacion[]> {
    return this.notificacionRepo.find({
      where: { id_usuario_destinatario: { id_usuario: usuarioId }, leida: false },
      order: { fecha_envio: 'DESC' },
    });
  }

  async listarTodas(usuarioId: number): Promise<Notificacion[]> {
    return this.notificacionRepo.find({
      where: { id_usuario_destinatario: { id_usuario: usuarioId } },
      order: { fecha_envio: 'DESC' },
    });
  }
}