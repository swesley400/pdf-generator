import { BadRequestException, Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import {
  PdfDto,
  ContentType,
  ContentItemDto,
  TextAlign,
  PdfOrientation,
  PdfPageSize,
} from './dto/pdf.dto';

@Injectable()
export class PdfService {
  async generatePdf(pdfData: PdfDto): Promise<Buffer> {
    try {
      return new Promise(async (resolve) => {
        const doc = new PDFDocument({
          size: pdfData.page,
          layout: pdfData.orientation,
          margins: {
            top: pdfData.margins.top * 72,
            bottom: pdfData.margins.bottom * 72,
            left: pdfData.margins.left * 72,
            right: pdfData.margins.right * 72,
          },
          autoFirstPage: true,
          bufferPages: true,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        try {
          // Calcula alturas do header e footer
          let headerHeight = 0;
          let footerHeight = 0;

          if (pdfData.header?.content?.length > 0) {
            const tempDoc = new PDFDocument({
              size: pdfData.page,
              layout: pdfData.orientation,
            });
            const headerContent = await this.processContent(
              tempDoc,
              pdfData.header.content,
              {
                isHeaderOrFooter: true,
              },
            );
            headerHeight = headerContent - tempDoc.page.margins.top + 20;
          }

          if (pdfData.footer?.content?.length > 0) {
            const tempDoc = new PDFDocument({
              size: pdfData.page,
              layout: pdfData.orientation,
            });
            const footerContent = await this.processContent(
              tempDoc,
              pdfData.footer.content,
              {
                isHeaderOrFooter: true,
              },
            );
            footerHeight = footerContent - tempDoc.page.margins.top + 20;
          }

          // Define área útil para conteúdo
          const contentStartY = doc.page.margins.top + headerHeight;
          const contentEndY =
            doc.page.height - doc.page.margins.bottom - footerHeight;

          // Process content
          if (pdfData.content?.length > 0) {
            await this.processContent(doc, pdfData.content, {
              y: contentStartY,
              maxContentHeight: contentEndY,
              headerHeight,
              footerHeight,
              header: pdfData.header?.content,
              footer: pdfData.footer?.content,
            });
          }

          // Get total pages
          const range = doc.bufferedPageRange();

          // Add header and footer to all pages
          for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);

            // Add header
            if (pdfData.header?.content?.length > 0) {
              await this.processContent(doc, pdfData.header.content, {
                y: doc.page.margins.top,
                isHeaderOrFooter: true,
              });
            }

            // Add footer
            if (pdfData.footer?.content?.length > 0) {
              await this.processContent(doc, pdfData.footer.content, {
                y: doc.page.height - doc.page.margins.bottom - footerHeight,
                isHeaderOrFooter: true,
              });
            }
          }

          doc.end();
        } catch (error) {
          console.error('Error generating PDF:', error);
          doc.end();
          throw error;
        }
      });
    } catch (error) {
      throw new BadRequestException('Error generating PDF: ' + error.message);
    }
  }

  private async processContent(
    doc: any,
    content: ContentItemDto[],
    options?: {
      x?: number;
      y?: number;
      width?: number;
      maxY?: number;
      maxContentHeight?: number;
      headerHeight?: number;
      footerHeight?: number;
      header?: ContentItemDto[];
      footer?: ContentItemDto[];
      isHeaderOrFooter?: boolean;
    },
  ) {
    let currentY = options?.y || doc.y;
    const startX = options?.x || doc.page.margins.left;
    const availableWidth =
      options?.width ||
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let maxChildY = currentY;

    // Calcula a altura máxima da página considerando o footer
    const maxPageY =
      options?.maxContentHeight ||
      doc.page.height -
        doc.page.margins.bottom -
        (options?.footerHeight || 0) -
        30; // 30px de margem de segurança

    for (const item of content) {
      try {
        // Verifica se precisa de nova página
        const estimatedHeight =
          item.type === ContentType.TEXT
            ? doc.heightOfString(item.content || '', { width: availableWidth })
            : item.height || 100;

        // Calcula se o próximo item vai ultrapassar o limite
        const willExceedLimit = currentY + estimatedHeight > maxPageY;

        // Se não for header/footer e vai exceder o limite, adiciona nova página
        if (!options?.isHeaderOrFooter && willExceedLimit) {
          doc.addPage();
          currentY = (options?.headerHeight || 0) + doc.page.margins.top;

          // Add header to new page
          if (options?.header) {
            await this.processContent(doc, options.header, {
              y: doc.page.margins.top,
              isHeaderOrFooter: true,
            });
          }

          // Add footer to new page
          if (options?.footer) {
            await this.processContent(doc, options.footer, {
              y:
                doc.page.height -
                doc.page.margins.bottom -
                (options.footerHeight || 0),
              isHeaderOrFooter: true,
            });
          }
        }

        // Processa o item atual
        switch (item.type) {
          case ContentType.TEXT:
            if (item.font) doc.font(item.font);
            if (item.size) doc.fontSize(item.size);
            if (item.color) doc.fillColor(item.color);

            // Se for um título, adiciona mais espaço antes
            if (item.size && item.size >= 18) {
              currentY += 10;
            }

            let textWidth = availableWidth;
            let textX = startX;

            // Se for texto centralizado, reduz a largura para melhor alinhamento
            if (item.align === TextAlign.CENTER) {
              textWidth = availableWidth * 0.8;
              textX = startX + (availableWidth - textWidth) / 2;
            }

            // Adiciona background se especificado
            if (item.backgroundColor) {
              const textHeight = doc.heightOfString(item.content || '', {
                width: textWidth,
                align: item.align || 'left',
                lineGap: item.lineGap || 2,
              });

              doc.save();
              doc.fillColor(item.backgroundColor);
              doc.rect(textX, currentY, textWidth, textHeight).fill();
              doc.restore();
            }

            doc.text(item.content || '', textX, currentY, {
              width: textWidth,
              align: item.align || 'left',
              lineGap: item.lineGap || 2,
            });

            currentY = doc.y + (item.size && item.size >= 18 ? 15 : 8);

            // Reset to defaults
            doc.font('Helvetica');
            doc.fontSize(12);
            doc.fillColor('black');
            break;

          case ContentType.IMAGE:
            if (item.content) {
              // Adiciona background se especificado
              if (item.backgroundColor) {
                doc.save();
                doc.fillColor(item.backgroundColor);
                doc.rect(startX, currentY, item.width || availableWidth, item.height || 100).fill();
                doc.restore();
              }

              const imageOptions: any = {
                width: item.width,
                height: item.height,
              };

              // PDFKit só aceita 'center' ou 'right' para imagens
              if (
                item.align === TextAlign.CENTER ||
                item.align === TextAlign.RIGHT
              ) {
                imageOptions.align = item.align;
              }

              doc.image(item.content, startX, currentY, imageOptions);
              currentY += (item.height || 0) + 10;
            }
            break;

          case ContentType.ROW:
            // Adiciona background se especificado
            if (item.backgroundColor) {
              const rowHeight = item.height || 100;
              doc.save();
              doc.fillColor(item.backgroundColor);
              doc.rect(startX, currentY, availableWidth, rowHeight).fill();
              doc.restore();
            }

            const rowGap = 15;
            const columnWidth =
              (availableWidth - rowGap * (item.childs?.length - 1)) /
              (item.childs?.length || 1);
            let maxRowHeight = 0;

            // Processa cada filho lado a lado
            if (item.childs?.length > 0) {
              for (let i = 0; i < item.childs.length; i++) {
                const childX = startX + i * (columnWidth + rowGap);
                const childStartY = currentY;

                await this.processContent(doc, [item.childs[i]], {
                  x: childX,
                  y: childStartY,
                  width: columnWidth,
                  maxY: maxChildY,
                  maxContentHeight: maxPageY,
                  headerHeight: options?.headerHeight,
                  footerHeight: options?.footerHeight,
                  header: options?.header,
                  footer: options?.footer,
                });

                maxRowHeight = Math.max(maxRowHeight, doc.y - childStartY);
              }

              currentY += maxRowHeight + rowGap;
              doc.y = currentY;
            }
            break;

          case ContentType.COLUMN:
            // Adiciona background se especificado
            if (item.backgroundColor) {
              const columnHeight = item.height || 100;
              doc.save();
              doc.fillColor(item.backgroundColor);
              doc.rect(startX, currentY, availableWidth, columnHeight).fill();
              doc.restore();
            }

            const columnGap = 10;

            if (item.childs?.length > 0) {
              for (const child of item.childs) {
                await this.processContent(doc, [child], {
                  x: startX,
                  y: currentY,
                  width: availableWidth,
                  maxContentHeight: maxPageY,
                  headerHeight: options?.headerHeight,
                  footerHeight: options?.footerHeight,
                  header: options?.header,
                  footer: options?.footer,
                });
                currentY = doc.y + columnGap;
              }
            }
            break;
        }

        maxChildY = Math.max(maxChildY, currentY);
        doc.y = currentY;
      } catch (error) {
        console.error('Error processing content item:', error);
        doc.text('[Error processing content]', startX, currentY);
        currentY += 20;
        doc.y = currentY;
      }
    }

    return maxChildY;
  }

  getDocumentStructure(): PdfDto {
    return {
      margins: {
        left: 1,
        right: 1,
        bottom: 1,
        top: 1,
      },
      orientation: PdfOrientation.LANDSCAPE,
      page: PdfPageSize.A4,
      header: {
        content: [
          {
            type: ContentType.ROW,
            childs: [
              {
                type: ContentType.TEXT,
                content: 'EMPRESA EXEMPLO LTDA.',
                font: 'Helvetica-Bold',
                size: 14,
                align: TextAlign.LEFT,
                color: '#2C3E50',
              },
              {
                type: ContentType.TEXT,
                content: 'RELATÓRIO DE VENDAS',
                font: 'Helvetica-Bold',
                size: 14,
                align: TextAlign.CENTER,
                color: '#2C3E50',
              },
              {
                type: ContentType.TEXT,
                content: 'Data: 21/01/2025',
                font: 'Helvetica',
                size: 12,
                align: TextAlign.RIGHT,
                color: '#7F8C8D',
              },
            ],
          },
        ],
      },
      content: [
        {
          type: ContentType.TEXT,
          content: 'Relatório de Vendas por Região',
          font: 'Helvetica-Bold',
          size: 24,
          align: TextAlign.CENTER,
          color: '#2C3E50',
        },
        {
          type: ContentType.ROW,
          childs: [
            {
              type: ContentType.COLUMN,
              childs: [
                {
                  type: ContentType.TEXT,
                  content: 'REGIÃO SUL',
                  font: 'Helvetica-Bold',
                  size: 18,
                  align: TextAlign.LEFT,
                  color: '#E74C3C',
                },
                {
                  type: ContentType.TEXT,
                  content: 'Dados Gerais',
                  font: 'Helvetica-Bold',
                  size: 14,
                  align: TextAlign.LEFT,
                  color: '#2980B9',
                },
                {
                  type: ContentType.TEXT,
                  content:
                    '• Total de Vendas: R$ 1.500.000,00\n• Ticket Médio: R$ 750,00\n• Número de Pedidos: 2.000\n• Taxa de Crescimento: 15%',
                  font: 'Helvetica',
                  size: 12,
                  align: TextAlign.LEFT,
                  color: '#34495E',
                },
              ],
            },
            {
              type: ContentType.COLUMN,
              childs: [
                {
                  type: ContentType.TEXT,
                  content: 'REGIÃO SUDESTE',
                  font: 'Helvetica-Bold',
                  size: 18,
                  align: TextAlign.LEFT,
                  color: '#E74C3C',
                },
                {
                  type: ContentType.TEXT,
                  content: 'Dados Gerais',
                  font: 'Helvetica-Bold',
                  size: 14,
                  align: TextAlign.LEFT,
                  color: '#2980B9',
                },
                {
                  type: ContentType.TEXT,
                  content:
                    '• Total de Vendas: R$ 2.800.000,00\n• Ticket Médio: R$ 850,00\n• Número de Pedidos: 3.294\n• Taxa de Crescimento: 8%',
                  font: 'Helvetica',
                  size: 12,
                  align: TextAlign.LEFT,
                  color: '#34495E',
                },
              ],
            },
            {
              type: ContentType.COLUMN,
              childs: [
                {
                  type: ContentType.TEXT,
                  content: 'REGIÃO NORTE',
                  font: 'Helvetica-Bold',
                  size: 18,
                  align: TextAlign.LEFT,
                  color: '#E74C3C',
                },
                {
                  type: ContentType.TEXT,
                  content: 'Dados Gerais',
                  font: 'Helvetica-Bold',
                  size: 14,
                  align: TextAlign.LEFT,
                  color: '#2980B9',
                },
                {
                  type: ContentType.TEXT,
                  content:
                    '• Total de Vendas: R$ 980.000,00\n• Ticket Médio: R$ 620,00\n• Número de Pedidos: 1.580\n• Taxa de Crescimento: 12%',
                  font: 'Helvetica',
                  size: 12,
                  align: TextAlign.LEFT,
                  color: '#34495E',
                },
              ],
            },
            {
              type: ContentType.COLUMN,
              childs: [
                {
                  type: ContentType.TEXT,
                  content: 'REGIÃO NORDESTE',
                  font: 'Helvetica-Bold',
                  size: 18,
                  align: TextAlign.LEFT,
                  color: '#E74C3C',
                },
                {
                  type: ContentType.TEXT,
                  content: 'Dados Gerais',
                  font: 'Helvetica-Bold',
                  size: 14,
                  align: TextAlign.LEFT,
                  color: '#2980B9',
                },
                {
                  type: ContentType.TEXT,
                  content:
                    '• Total de Vendas: R$ 1.200.000,00\n• Ticket Médio: R$ 680,00\n• Número de Pedidos: 1.765\n• Taxa de Crescimento: 10%',
                  font: 'Helvetica',
                  size: 12,
                  align: TextAlign.LEFT,
                  color: '#34495E',
                },
              ],
            },
          ],
        },
      ],
      footer: {
        content: [
          {
            type: ContentType.ROW,
            childs: [
              {
                type: ContentType.TEXT,
                content: 'Gerado em: 21/01/2025 13:21',
                font: 'Helvetica',
                size: 10,
                align: TextAlign.LEFT,
                color: '#7F8C8D',
              },
              {
                type: ContentType.TEXT,
                content: 'Relatório de Vendas - Q4 2024',
                font: 'Helvetica',
                size: 10,
                align: TextAlign.CENTER,
                color: '#7F8C8D',
              },
              {
                type: ContentType.TEXT,
                content: 'Página 1 de 1',
                font: 'Helvetica',
                size: 10,
                align: TextAlign.RIGHT,
                color: '#7F8C8D',
              },
            ],
          },
        ],
      },
    };
  }
}
