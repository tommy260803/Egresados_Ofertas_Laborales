import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  listarTodas(@CurrentUser() user: { userId: number }) {
    return this.notificacionesService.listarTodas(user.userId);
  }

  @Get('no-leidas')
  listarNoLeidas(@CurrentUser() user: { userId: number }) {
    return this.notificacionesService.listarNoLeidas(user.userId);
  }

  @Patch(':id/leer')
  marcarLeida(@Param('id') id: string, @CurrentUser() user: { userId: number }) {
    return this.notificacionesService.marcarComoLeida(+id, user.userId);
  }
}