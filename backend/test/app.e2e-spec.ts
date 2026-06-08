import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { HealthController } from '../src/modules/health/health.controller';
import { MailService } from '../src/modules/mail/mail.service';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) },
        },
        {
          provide: MailService,
          useValue: { isConfigured: () => false },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/health returns service status', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          ok: true,
          db: 'up',
          mail: 'dev-log',
          ws: 'socket.io',
        });
        expect(res.body).toHaveProperty('timestamp');
      });
  });
});
