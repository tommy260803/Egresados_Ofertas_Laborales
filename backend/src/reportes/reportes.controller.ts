import { Controller, Post, Body, Get, Param, UseGuards, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RbacGuard } from '../auth/guards/rbac.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../auth/entities/usuario.entity';
import { Response } from 'express';
import * as fs from 'fs';

class SolicitarReporteDto {
  tipo:
    | 'egresados_por_carrera'
    | 'ofertas_activas'
    | 'postulaciones_por_oferta'
    | 'empleabilidad_por_carrera'
    | 'habilidades_mas_demandadas';
  parametros: {
    fechaDesde?: string;
    fechaHasta?: string;
    carrera?: string;
    sector?: string;
    ofertaId?: number;
  };
}

@Controller('reportes')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReportesController {
  constructor(private service: ReportesService) {}

  @Post('solicitar')
  @Roles('administrador')
  async solicitar(@CurrentUser() user: Usuario, @Body() dto: SolicitarReporteDto) {
    return this.service.solicitarReporteAdmin(user, dto.tipo, dto.parametros);
  }

  @Get('estado/:id')
  @Roles('administrador')
  estado(@Param('id') id: string) {
    return this.service.obtenerEstado(+id);
  }

  @Get('descargar/:id')
  @Roles('administrador')
  async descargar(@Param('id') id: string, @Res() res: Response) {
    const reporte = await this.service.obtenerEstado(+id);
    if (reporte.estado !== 'completado' || !reporte.url_pdf) throw new Error('No disponible');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${reporte.id_reporte}.pdf`);
    const stream = fs.createReadStream(reporte.url_pdf);
    stream.pipe(res);
  }
}