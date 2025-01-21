import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PropertiesController } from './controllers/properties.controller';
import { PdfController } from './pdf.controller';

@Module({
  controllers: [PdfController, PropertiesController],
  providers: [PdfService],
})
export class PdfModule {}
