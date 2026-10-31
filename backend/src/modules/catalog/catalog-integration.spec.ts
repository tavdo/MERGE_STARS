import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { MeshyService } from './meshy.service';

describe('Combined catalog HTTP routes', () => {
  let app: INestApplication;
  const catalog = {
    museumPage: jest.fn(async () => ({ items: [], total: 0 })),
    getPublicBySlug: jest.fn(async (slug: string) => ({ slug, items: [] })),
    listMasterNav: jest.fn(() => ({ houses: [] })),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        { provide: CatalogService, useValue: catalog },
        { provide: MeshyService, useValue: {} },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(async () => app?.close());

  it('serves the incoming museum endpoint before the original public slug route', async () => {
    await request(app.getHttpServer()).get('/api/catalog/public/museum?page=2').expect(200);
    expect(catalog.museumPage).toHaveBeenCalled();
    expect(catalog.getPublicBySlug).not.toHaveBeenCalled();
  });

  it('keeps original public collection and master-house navigation routes available', async () => {
    await request(app.getHttpServer()).get('/api/catalog/public/my-collection').expect(200);
    expect(catalog.getPublicBySlug).toHaveBeenCalledWith('my-collection');
    await request(app.getHttpServer()).get('/api/catalog/master/houses').expect(200);
    expect(catalog.listMasterNav).toHaveBeenCalled();
  });
});
