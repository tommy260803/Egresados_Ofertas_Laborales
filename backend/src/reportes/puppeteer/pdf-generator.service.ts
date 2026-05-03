import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  async generatePdfFromHtml(html: string, outputPath: string): Promise<{ buffer: Buffer, size: number }> {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, pdfBuffer);
    return { buffer: pdfBuffer, size: pdfBuffer.length };
  }

  async renderTemplate(templateName: string, data: any): Promise<string> {
    const candidatePaths = [
      join(process.cwd(), 'src', 'reportes', 'templates', `${templateName}.hbs`),
      join(process.cwd(), 'dist', 'reportes', 'templates', `${templateName}.hbs`),
      join(process.cwd(), 'templates', `${templateName}.hbs`),
    ];
    let templatePath = candidatePaths[0];
    for (const candidate of candidatePaths) {
      try {
        await fs.access(candidate);
        templatePath = candidate;
        break;
      } catch {
        // Continue checking next candidate
      }
    }
    const source = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(source);
    return template(data);
  }
}