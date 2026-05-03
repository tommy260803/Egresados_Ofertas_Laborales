import { Controller, Post, Body, Get, Param, UseGuards, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RbacGuard } from '../auth/guards/rbac.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../auth/entities/usuario.entity';
import { Response } from 'express';
import * as fs from 'fs';

interface SolicitarReporteDto {
  tipo:
    | 'egresados_por_carrera'
    | 'ofertas_activas'
    | 'postulaciones_por_oferta'
    | 'empleabilidad_por_carrera'
    | 'habilidades_mas_demandadas';
  parametros?: {
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

  @Post('generar')
  @Roles('administrador')
  async generar(
    @CurrentUser() user: Usuario,
    @Body() body: any,
    @Res() res: Response
  ) {
    try {
      console.log('tipo:', body.tipo);
      console.log('parametros:', body.parametros);
      
      const { buffer, filename } = await this.service.generarReporteSync(user, body.tipo, body.parametros);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(buffer);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      res.status(500).json({ 
        error: 'Error al generar el reporte', 
        message: error.message,
        details: error.stack 
      });
    }
  }

  @Post('solicitar')
  @Roles('administrador')
  async solicitar(@CurrentUser() user: Usuario, @Body() body: any, @Res() res: Response) {
    return this.generar(user, body, res);
  }
}