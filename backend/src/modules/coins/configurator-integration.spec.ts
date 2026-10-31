import { CoinsService } from './coins.service';
import { User } from '../../database/entities/user.entity';
import { SubmitApplicationDto } from './dto/submit-application.dto';

describe('Configurator to Brand House request', () => {
  function fixture() {
    const configurator = {
      getSessionForApplication: jest.fn(async () => ({ status: 'finalized' })),
      getOrderSnapshot: jest.fn(async () => ({ session: { id: 'session', products: ['design'] } })),
      lockSession: jest.fn(async () => undefined),
    };
    const apps = {
      findOne: jest.fn(async () => null),
      create: jest.fn(row => ({ ...row, submittedAt: new Date(), updatedAt: new Date() })),
      save: jest.fn(async row => row),
    };
    const service = Object.assign(Object.create(CoinsService.prototype), {
      apps, configurator,
      nextPublicId: () => 'APP-test',
      resolveDesign: async () => ({ catalogItemId: null, designAuthorId: null }),
      usersService: { findById: async () => ({ firstName: 'Test', lastName: 'Member', email: 'test@example.invalid' }) },
      mail: { sendApplicationReceived: async () => undefined },
      notifications: { create: async () => undefined },
    }) as CoinsService;
    return { service, apps, configurator };
  }
  const dto = {
    brandHouseName: 'Test house', coinType: 'silver', metalType: 'silver', quantity: 1,
    coinValue: 9999, configuratorSessionId: 'session',
  } as SubmitApplicationDto;

  it('preserves the owned finalized design snapshot without trusting a client price', async () => {
    const { service, apps, configurator } = fixture();
    const result = await service.submit({ id: 'member' } as User, dto);
    expect(configurator.getSessionForApplication).toHaveBeenCalledWith('session', 'member');
    expect(apps.save).toHaveBeenCalledWith(expect.objectContaining({
      configuratorSessionId: 'session', coinValue: 0, priceQuotedAt: null,
      orderSnapshotJson: { session: { id: 'session', products: ['design'] } },
    }));
    expect(configurator.lockSession).toHaveBeenCalledWith('session', 'member');
    expect(result.configuratorSessionId).toBe('session');
  });

  it('does not save a request when its configuration is unowned or unfinished', async () => {
    const { service, apps, configurator } = fixture();
    configurator.getSessionForApplication.mockRejectedValueOnce(new Error('Finalize your coin configuration first'));
    await expect(service.submit({ id: 'member' } as User, dto)).rejects.toThrow('Finalize');
    expect(apps.save).not.toHaveBeenCalled();
    expect(configurator.lockSession).not.toHaveBeenCalled();
  });
});
