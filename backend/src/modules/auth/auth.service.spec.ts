import { AuthService } from './auth.service';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { User } from '../../database/entities/user.entity';

describe('Refresh token account checks', () => {
  function fixture(status = 'active', expired = false) {
    const tokens = {
      findOne: jest.fn(async () => ({
        id: 'refresh-1',
        userId: 'member',
        expiresAt: new Date(Date.now() + (expired ? -1000 : 60000)),
      })),
      delete: jest.fn(async () => undefined),
      create: jest.fn((row) => row),
      save: jest.fn(async (row) => row),
    };
    const user = {
      id: 'member',
      email: 'member@example.test',
      status,
      roles: ['user'],
      createdAt: new Date(),
    };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === RefreshToken ? tokens : { findOne: async () => user },
      ),
    };
    const transaction = jest.fn(async (work) => work(manager));
    const jwt = { sign: jest.fn(() => 'access') };
    const service = Object.assign(Object.create(AuthService.prototype), {
      refreshTokens: { manager: { transaction } },
      jwt,
    }) as AuthService;
    return { service, tokens, jwt, manager, transaction };
  }

  it('does not rotate or issue tokens for a disabled account', async () => {
    const f = fixture('blocked');
    await expect(f.service.refresh('old')).rejects.toThrow('Account disabled');
    expect(f.jwt.sign).not.toHaveBeenCalled();
    expect(f.tokens.delete).not.toHaveBeenCalled();
  });
  it('rejects an expired token before issuing another token', async () => {
    const f = fixture('active', true);
    await expect(f.service.refresh('old')).rejects.toThrow(
      'Refresh token expired',
    );
    expect(f.tokens.save).not.toHaveBeenCalled();
  });
  it('locks and replaces the token within the same transaction', async () => {
    const f = fixture();
    const result = await f.service.refresh('old');
    expect(result.accessToken).toBe('access');
    expect(f.tokens.findOne).toHaveBeenCalledWith({
      where: { token: 'old' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(f.tokens.delete).toHaveBeenCalledWith({ id: 'refresh-1' });
    expect(f.tokens.save).toHaveBeenCalledTimes(1);
    expect(f.manager.getRepository).toHaveBeenCalledWith(User);
    expect(f.transaction).toHaveBeenCalledTimes(1);
  });
});
