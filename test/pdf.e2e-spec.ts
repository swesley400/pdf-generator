import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';
import { PdfOrientation, PdfPageSize } from '../src/pdf/dto/pdf.dto';

describe('PdfController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/pdf/structure (GET)', () => {
    return request(app.getHttpServer())
      .get('/pdf/structure')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('pdf');
        expect(res.body.pdf).toHaveProperty('margins');
        expect(res.body.pdf).toHaveProperty('orientation');
        expect(res.body.pdf).toHaveProperty('content');
      });
  });

  it('/pdf/generate (POST) - should generate a PDF', async () => {
    const testData = {
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
            column: {
              position: 'center',
              type: 'text',
              content: 'Test PDF Header',
            },
          },
        ],
      },
      content: [
        {
          type: 'text',
          content: 'Test PDF Generation',
          font: 'Helvetica-Bold',
          size: 24,
          align: 'center',
          color: '#2C3E50',
        },
        {
          type: 'text',
          content: 'This is a test content with different colors',
          font: 'Helvetica',
          size: 14,
          align: 'left',
          color: '#E74C3C',
        },
      ],
      footer: {
        content: [
          {
            column: {
              position: 'center',
              type: 'text',
              content: 'Page 1',
            },
          },
        ],
      },
    };

    const response = await request(app.getHttpServer())
      .post('/pdf/generate')
      .send(testData)
      .expect(200)
      .expect('Content-Type', 'application/pdf');

    // Optional: Save the generated PDF for manual inspection
    const testOutputDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir);
    }

    const pdfPath = path.join(testOutputDir, 'test-output.pdf');
    fs.writeFileSync(pdfPath, response.body);

    // Verify the response is a non-empty buffer
    expect(Buffer.isBuffer(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/pdf/generate (POST) - should handle invalid input', () => {
    const invalidData = {
      invalidField: 'this should not be here',
      margins: {
        left: 'invalid', // Should be a number
        right: 1,
        bottom: 1,
        top: 1,
      },
      orientation: 'invalid_orientation', // Should be 'portrait' or 'landscape'
      page: 123, // Should be a string
      content: 'invalid', // Should be an array
    };

    return request(app.getHttpServer())
      .post('/pdf/generate')
      .send(invalidData)
      .expect(400); // Should return Bad Request due to validation
  });
});
