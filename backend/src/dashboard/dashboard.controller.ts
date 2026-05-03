import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RbacGuard } from '../auth/guards/rbac.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RbacGuard)
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('admin')
  @Roles('administrador')
  adminKpis() {
    return this.service.getAdminKpis();
  }

  @Get('egresado')
  @Roles('egresado')
  egresadoKpis(@CurrentUser() user: { userId: number }) {
    return this.service.getEgresadoKpi(user.userId);
  }

  @Get('empresa')
  @Roles('empresa')
  empresaKpis(@CurrentUser() user: { userId: number }) {
    return this.service.getEmpresaKpi(user.userId);
  }

  @Get('tendencias')
  @Roles('administrador', 'egresado', 'empresa')
  tendencias(@CurrentUser() user: { userId: number; rol: 'administrador' | 'egresado' | 'empresa' }) {
    if (user.rol === 'administrador') return this.service.getTendenciasMensuales('admin');
    if (user.rol === 'egresado') return this.service.getTendenciasMensuales('egresado', user.userId);
    if (user.rol === 'empresa') return this.service.getTendenciasMensuales('empresa', user.userId);
  }

  @Get('habilidades-top')
  @Roles('administrador', 'empresa')
  topHabilidades() {
    return this.service.getRankingHabilidades();
  }
}