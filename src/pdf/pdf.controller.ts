import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { PdfDto } from './dto/pdf.dto';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async generatePdf(
    @Body() pdfData: PdfDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.pdfService.generatePdf(pdfData);

    res
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf',
        'Content-Length': buffer.length,
      })
      .status(HttpStatus.OK)
      .send(buffer);
  }

  @Get('structure')
  getDocumentStructure() {
    return this.pdfService.getDocumentStructure();
  }
}
