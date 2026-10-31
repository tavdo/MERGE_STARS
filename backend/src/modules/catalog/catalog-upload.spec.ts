import { CatalogService } from './catalog.service';
import { rename, unlink } from 'fs/promises';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(async () => undefined),
  rename: jest.fn(async () => undefined),
  writeFile: jest.fn(async () => undefined),
  unlink: jest.fn(async () => undefined),
}));

describe('3D upload cleanup', () => {
  const file = {
    originalname: 'model.glb',
    mimetype: 'model/gltf-binary',
    size: 100,
    path: 'temporary/model.glb',
  } as Express.Multer.File;
  beforeEach(() => jest.clearAllMocks());
  function fixture(ownedItem: jest.Mock, save = jest.fn()) {
    return Object.assign(Object.create(CatalogService.prototype), {
      ownedItem,
      itemDir: () => 'uploads/item',
      items: { save },
    }) as CatalogService;
  }
  it('removes the temporary file when the item is not owned by the uploader', async () => {
    const service = fixture(
      jest.fn().mockRejectedValue(new Error('Not owned')),
    );
    await expect(service.uploadModel3d('user', 'item', file)).rejects.toThrow(
      'Not owned',
    );
    expect(unlink).toHaveBeenCalledWith(file.path);
    expect(rename).not.toHaveBeenCalled();
  });
  it('removes the moved model if saving its database record fails', async () => {
    const service = fixture(
      jest.fn().mockResolvedValue({ id: 'item' }),
      jest.fn().mockRejectedValue(new Error('Database unavailable')),
    );
    await expect(service.uploadModel3d('user', 'item', file)).rejects.toThrow(
      'Database unavailable',
    );
    const destination = (rename as jest.Mock).mock.calls[0][1];
    expect(unlink).toHaveBeenCalledWith(destination);
  });
});
