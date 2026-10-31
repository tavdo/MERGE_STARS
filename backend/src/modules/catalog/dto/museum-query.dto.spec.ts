import { validate } from 'class-validator';
import { MuseumQueryDto } from './museum-query.dto';

describe('Museum query boundary', () => {
  it('rejects nested search input and invalid page values', async () => {
    const dto = Object.assign(new MuseumQueryDto(), { q: ['not', 'a string'], page: '-1' });
    const errors = await validate(dto);
    expect(errors.map(error => error.property)).toEqual(expect.arrayContaining(['q', 'page']));
  });
  it('rejects unknown visibility controls at the public route', async () => {
    const dto = Object.assign(new MuseumQueryDto(), { visibility: 'PRIVATE' });
    expect(await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).toHaveLength(1);
  });
});
