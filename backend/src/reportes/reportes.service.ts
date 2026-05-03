import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reporte } from './entities/reporte.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { Egresado } from '../egresados/entities/egresado.entity';
import { OfertaLaboral } from '../ofertas/entities/oferta-laboral.entity';
import { Postulacion } from '../ofertas/entities/postulacion.entity';
import { PdfGeneratorService } from './puppeteer/pdf-generator.service';

export type TipoReporteAdmin =
  | 'egresados_por_carrera'
  | 'ofertas_activas'
  | 'postulaciones_por_oferta'
  | 'empleabilidad_por_carrera'
  | 'habilidades_mas_demandadas';

export interface ReporteFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  carrera?: string;
  sector?: string;
  ofertaId?: number;
}

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(
    @InjectRepository(Reporte) private reporteRepo: Repository<Reporte>,
    @InjectRepository(Egresado) private egresadoRepo: Repository<Egresado>,
    @InjectRepository(OfertaLaboral) private ofertaRepo: Repository<OfertaLaboral>,
    @InjectRepository(Postulacion) private postulacionRepo: Repository<Postulacion>,
    private pdfService: PdfGeneratorService,
  ) {}

  async generarReporteSync(
    user: Usuario,
    tipo: TipoReporteAdmin,
    filtros: ReporteFiltros = {},
  ): Promise<{ buffer: Buffer; filename: string }> {
    try {
      console.log('tipo:', tipo);
      console.log('parametros:', filtros);
      
      const filtrosValidados = filtros || {};
      const { template, data } = await this.prepararReporte(tipo, filtrosValidados);
      
      console.log('Template:', template);
      console.log('Data rows count:', data.rows?.length || 0);
      
      const html = await this.pdfService.renderTemplate(template, data);
      console.log('HTML generated, length:', html.length);
      
      const filename = `${tipo}_${uuidv4()}.pdf`;
      const outputPath = join(process.cwd(), 'reports', filename);
      
      const { buffer, size } = await this.pdfService.generatePdfFromHtml(html, outputPath);
      console.log('PDF generated, size:', size);
      
      // Guardar registro en BD para historial
      // TODO: Fix TypeORM update error with Usuario relation
      // const reporte = this.reporteRepo.create({
      //   nombre_reporte: filename,
      //   tipo_reporte: tipo,
      //   parametros: filtrosValidados as any,
      //   generado_por: { id_usuario: user.id_usuario } as Usuario,
      //   estado: 'completado',
      //   url_pdf: outputPath,
      //   tamano_bytes: size,
      //   fecha_completado: new Date(),
      // });
      // await this.reporteRepo.save(reporte);

      return { buffer, filename };
    } catch (error) {
      console.error('Error in generarReporteSync:', error);
      throw error;
    }
  }

  private parseFechas(filtros: ReporteFiltros) {
    const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : undefined;
    const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : undefined;
    return { fechaDesde, fechaHasta };
  }

  private resumenFiltros(filtros: ReporteFiltros) {
    return {
      fechaDesde: filtros.fechaDesde || '-',
      fechaHasta: filtros.fechaHasta || '-',
      carrera: filtros.carrera || 'Todas',
      sector: filtros.sector || 'Todos',
      ofertaId: filtros.ofertaId ? String(filtros.ofertaId) : '-',
    };
  }

  private async prepararReporte(tipo: TipoReporteAdmin, filtros: ReporteFiltros) {
    const base = {
      generatedAt: new Date().toLocaleString('es-PE'),
      filtros: this.resumenFiltros(filtros),
    };

    switch (tipo) {
      case 'egresados_por_carrera': {
        const rows = await this.reporteEgresadosPorCarrera(filtros);
        return { template: 'reporte_egresados_por_carrera', data: { ...base, titulo: 'Listado de egresados por carrera', rows } };
      }
      case 'ofertas_activas': {
        const rows = await this.reporteOfertasActivas(filtros);
        return { template: 'reporte_ofertas_activas', data: { ...base, titulo: 'Listado de ofertas activas', rows } };
      }
      case 'postulaciones_por_oferta': {
        const rows = await this.reportePostulacionesPorOferta(filtros);
        return { template: 'reporte_postulaciones_por_oferta', data: { ...base, titulo: 'Postulaciones por oferta', rows } };
      }
      case 'empleabilidad_por_carrera': {
        const rows = await this.reporteEmpleabilidadPorCarrera(filtros);
        return { template: 'reporte_empleabilidad_por_carrera', data: { ...base, titulo: 'Empleabilidad por carrera', rows } };
      }
      case 'habilidades_mas_demandadas': {
        const rows = await this.reporteHabilidadesMasDemandadas(filtros);
        return { template: 'reporte_habilidades_mas_demandadas', data: { ...base, titulo: 'Top 10 habilidades mas demandadas', rows } };
      }
      default:
        throw new NotFoundException('Tipo de reporte no soportado');
    }
  }

  private async reporteEgresadosPorCarrera(filtros: ReporteFiltros) {
    const { fechaDesde, fechaHasta } = this.parseFechas(filtros);
    const qb = this.egresadoRepo
      .createQueryBuilder('e')
      .leftJoin('e.usuario', 'u')
      .select('e.nombres', 'nombres')
      .addSelect('e.apellidos', 'apellidos')
      .addSelect('u.email', 'email')
      .addSelect('e.telefono', 'telefono')
      .addSelect('e.ciudad', 'ciudad')
      .addSelect('e.carrera', 'carrera')
      .where('1=1');
    if (filtros.carrera) qb.andWhere('e.carrera ILIKE :carrera', { carrera: `%${filtros.carrera}%` });
    if (fechaDesde) qb.andWhere('u.created_at >= :fechaDesde', { fechaDesde });
    if (fechaHasta) qb.andWhere('u.created_at <= :fechaHasta', { fechaHasta });
    qb.orderBy('e.carrera', 'ASC').addOrderBy('e.apellidos', 'ASC');
    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      nombres: `${r.nombres || ''} ${r.apellidos || ''}`.trim(),
      email: r.email || '-',
      telefono: r.telefono || '-',
      ciudad: r.ciudad || '-',
      carrera: r.carrera || '-',
    }));
  }

  private async reporteOfertasActivas(filtros: ReporteFiltros) {
    const { fechaDesde, fechaHasta } = this.parseFechas(filtros);
    const qb = this.ofertaRepo
      .createQueryBuilder('o')
      .innerJoin('o.empresa', 'empresa')
      .select('o.titulo', 'titulo')
      .addSelect('empresa.razon_social', 'empresa')
      .addSelect('empresa.sector', 'sector')
      .addSelect('o.modalidad', 'modalidad')
      .addSelect("CONCAT(COALESCE(o.salario_minimo::text, '-'), ' - ', COALESCE(o.salario_maximo::text, '-'))", 'salario')
      .addSelect("TO_CHAR(o.fecha_cierre, 'YYYY-MM-DD')", 'fecha_cierre')
      .where('o.activa = true');
    if (filtros.sector) qb.andWhere('empresa.sector ILIKE :sector', { sector: `%${filtros.sector}%` });
    if (fechaDesde) qb.andWhere('o.fecha_publicacion >= :fechaDesde', { fechaDesde });
    if (fechaHasta) qb.andWhere('o.fecha_publicacion <= :fechaHasta', { fechaHasta });
    qb.orderBy('o.fecha_cierre', 'ASC');
    return qb.getRawMany();
  }

  private async reportePostulacionesPorOferta(filtros: ReporteFiltros) {
    if (!filtros.ofertaId) return [];
    const { fechaDesde, fechaHasta } = this.parseFechas(filtros);
    const qb = this.postulacionRepo
      .createQueryBuilder('p')
      .innerJoin('p.oferta', 'o')
      .innerJoin('p.egresado', 'e')
      .leftJoin('e.usuario', 'u')
      .select('o.titulo', 'oferta_titulo')
      .addSelect('e.nombres', 'nombres')
      .addSelect('e.apellidos', 'apellidos')
      .addSelect('u.email', 'email')
      .addSelect('p.estado_actual', 'estado_actual')
      .addSelect("TO_CHAR(p.fecha_postulacion, 'YYYY-MM-DD')", 'fecha_postulacion')
      .where('o.id_oferta = :ofertaId', { ofertaId: filtros.ofertaId });
    if (fechaDesde) qb.andWhere('p.fecha_postulacion >= :fechaDesde', { fechaDesde });
    if (fechaHasta) qb.andWhere('p.fecha_postulacion <= :fechaHasta', { fechaHasta });
    qb.orderBy('p.fecha_postulacion', 'DESC');
    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      oferta_titulo: r.oferta_titulo || '-',
      egresado: `${r.nombres || ''} ${r.apellidos || ''}`.trim(),
      email: r.email || '-',
      estado_actual: r.estado_actual || '-',
      fecha_postulacion: r.fecha_postulacion || '-',
    }));
  }

  private async reporteEmpleabilidadPorCarrera(filtros: ReporteFiltros) {
    const { fechaDesde, fechaHasta } = this.parseFechas(filtros);
    const egresadosQb = this.egresadoRepo
      .createQueryBuilder('e')
      .select('e.carrera', 'carrera')
      .addSelect('COUNT(*)', 'total_egresados')
      .groupBy('e.carrera');
    if (filtros.carrera) egresadosQb.where('e.carrera ILIKE :carrera', { carrera: `%${filtros.carrera}%` });
    const egresados = await egresadosQb.getRawMany();

    const contratadosQb = this.postulacionRepo
      .createQueryBuilder('p')
      .innerJoin('p.egresado', 'e')
      .innerJoin('p.oferta', 'o')
      .innerJoin('o.empresa', 'empresa')
      .select('e.carrera', 'carrera')
      .addSelect('COUNT(DISTINCT e.id_egresado)', 'contratados')
      .where("p.estado_actual = 'contratado'")
      .groupBy('e.carrera');
    if (filtros.carrera) contratadosQb.andWhere('e.carrera ILIKE :carrera', { carrera: `%${filtros.carrera}%` });
    if (filtros.sector) contratadosQb.andWhere('empresa.sector ILIKE :sector', { sector: `%${filtros.sector}%` });
    if (fechaDesde) contratadosQb.andWhere('p.fecha_postulacion >= :fechaDesde', { fechaDesde });
    if (fechaHasta) contratadosQb.andWhere('p.fecha_postulacion <= :fechaHasta', { fechaHasta });
    const contratados = await contratadosQb.getRawMany();
    const mapContratados = new Map(contratados.map((item) => [item.carrera, Number(item.contratados)]));

    return egresados.map((item) => {
      const total = Number(item.total_egresados) || 0;
      const contratadosCount = mapContratados.get(item.carrera) || 0;
      const tasa = total > 0 ? ((contratadosCount / total) * 100).toFixed(2) : '0.00';
      return {
        carrera: item.carrera || '-',
        total_egresados: total,
        contratados: contratadosCount,
        tasa: `${tasa}%`,
      };
    });
  }

  private async reporteHabilidadesMasDemandadas(filtros: ReporteFiltros) {
    const { fechaDesde, fechaHasta } = this.parseFechas(filtros);
    const qb = this.ofertaRepo
      .createQueryBuilder('o')
      .innerJoin('o.empresa', 'empresa')
      .innerJoin('o.habilidades', 'h')
      .select('h.nombre_habilidad', 'habilidad')
      .addSelect('COUNT(DISTINCT o.id_oferta)', 'cantidad_ofertas')
      .where('o.activa = true')
      .groupBy('h.nombre_habilidad')
      .orderBy('cantidad_ofertas', 'DESC')
      .limit(10);
    if (filtros.sector) qb.andWhere('empresa.sector ILIKE :sector', { sector: `%${filtros.sector}%` });
    if (fechaDesde) qb.andWhere('o.fecha_publicacion >= :fechaDesde', { fechaDesde });
    if (fechaHasta) qb.andWhere('o.fecha_publicacion <= :fechaHasta', { fechaHasta });
    return qb.getRawMany();
  }
}