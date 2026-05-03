import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EgresadosService } from './egresados.service';
import { EgresadosController } from './egresados.controller';
import { Egresado } from './entities/egresado.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Habilidad } from '../ofertas/entities/habilidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Egresado, Usuario, Habilidad])],
  providers: [EgresadosService],
  controllers: [EgresadosController],
  exports: [EgresadosService],
})
export class EgresadosModule {}