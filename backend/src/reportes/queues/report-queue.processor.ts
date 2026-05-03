import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PdfGeneratorService } from '../puppeteer/pdf-generator.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reporte } from '../entities/reporte.entity';
import { Logger } from '@nestjs/common';

@Processor('reportes')
export class ReportQueueProcessor {
  private readonly logger = new Logger(ReportQueueProcessor.name);

  constructor(
    private pdfService: PdfGeneratorService,
    @InjectRepository(Reporte) private reporteRepo: Repository<Reporte>,
  ) {}

  @Process('generar-pdf')
  async handleGenerarPdf(job: Job<{ reporteId: number, template: string, data: any, outputFile: string }>) {
    const { reporteId, template, data, outputFile } = job.data;
    this.logger.log(`Generando reporte - reporteId: ${reporteId}, outputFile: ${outputFile}`);
    try {
      const html = await this.pdfService.renderTemplate(template, data);
      const { size } = await this.pdfService.generatePdfFromHtml(html, outputFile);
      this.logger.log(`PDF generado exitosamente - size: ${size}, outputFile: ${outputFile}`);
      this.logger.log(`Actualizando reporte con id_reporte: ${reporteId}, estado: completado, fecha_completado: ${new Date()}, url_pdf: ${outputFile}, tamano_bytes: ${size}`);
      await this.reporteRepo.update({ id_reporte: reporteId }, {
        estado: 'completado',
        fecha_completado: new Date(),
        url_pdf: outputFile,
        tamano_bytes: size,
      });
      return { success: true };
    } catch (err) {
      this.logger.error(`Error al generar PDF para reporteId: ${reporteId}. Error: ${err.message}`);
      this.logger.log(`Actualizando reporte con id_reporte: ${reporteId}, estado: fallido`);
      await this.reporteRepo.update({ id_reporte: reporteId }, { estado: 'fallido' });
      throw err;
    }
  }
}