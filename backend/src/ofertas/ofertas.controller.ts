import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import { UpdateOfertaDto } from './dto/update-oferta.dto';
import { PostularDto, UpdatePostulacionEstadoDto } from './dto/postulacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles, RbacGuard } from '../auth/guards/rbac.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ofertas')
@UseGuards(JwtAuthGuard, RbacGuard)
export class OfertasController {
  constructor(private readonly service: OfertasService) {}

  @Post()
  @Roles('empresa')
  create(@CurrentUser() user: { userId: number }, @Body() dto: CreateOfertaDto) {
    return this.service.create(user.userId, dto);
  }

  @Get()
  @Roles('administrador', 'egresado', 'empresa')
  findAll(@Query() query: Record<string, unknown>) {
    return this.service.findAll(query);
  }

  @Post('postular')
  @Roles('egresado')
  postular(@CurrentUser() user: { userId: number }, @Body() dto: PostularDto) {
    return this.service.postular(user.userId, dto);
  }

  @Get('postulaciones/mis-postulaciones')
  @Roles('egresado')
  misPostulaciones(@CurrentUser() user: { userId: number }) {
    return this.service.listarPostulacionesPorEgresado(user.userId);
  }

  @Get(':id')
  @Roles('administrador', 'egresado', 'empresa')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles('empresa')
  update(@Param('id') id: string, @CurrentUser() user: { userId: number }, @Body() dto: UpdateOfertaDto) {
    return this.service.update(+id, user.userId, dto);
  }

  @Delete(':id')
  @Roles('empresa')
  remove(@Param('id') id: string, @CurrentUser() user: { userId: number }) {
    return this.service.remove(+id, user.userId);
  }

  @Put('postulaciones/:idPostulacion/estado')
  @Roles('empresa')
  cambiarEstado(@Param('idPostulacion') idPost: string, @CurrentUser() user: { userId: number }, @Body() dto: UpdatePostulacionEstadoDto) {
    return this.service.cambiarEstadoPostulacion(+idPost, user.userId, dto);
  }

  @Get(':idOferta/postulaciones')
  @Roles('empresa')
  postulacionesDeOferta(@Param('idOferta') idOferta: string, @CurrentUser() user: { userId: number }) {
    return this.service.listarPostulacionesPorOferta(+idOferta, user.userId);
  }
}