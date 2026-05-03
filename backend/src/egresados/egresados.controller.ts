import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { EgresadosService } from './egresados.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RbacGuard } from '../auth/guards/rbac.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('egresados')
@UseGuards(JwtAuthGuard, RbacGuard)
export class EgresadosController {
  constructor(private readonly egresadosService: EgresadosService) {}

  @Post()
  @Roles('administrador', 'egresado')
  create(@CurrentUser() user, @Body() dto: CreateEgresadoDto) {
    return this.egresadosService.create(user.userId, dto);
  }

  @Get()
  @Roles('administrador', 'empresa')
  findAll(@Query() query) {
    return this.egresadosService.findAll(query);
  }

  @Get(':id')
  @Roles('administrador', 'egresado', 'empresa')
  findOne(@Param('id') id: string) {
    return this.egresadosService.findOne(+id);
  }

  @Put(':id')
  @Roles('administrador', 'egresado')
  update(@Param('id') id: string, @Body() dto: UpdateEgresadoDto, @CurrentUser() user) {
    if (user.rol === 'egresado' && +id !== user.userId) throw new ForbiddenException();
    return this.egresadosService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id') id: string) {
    return this.egresadosService.remove(+id);
  }
}