import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { User } from '../database/entities/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

describe('Audit identity', () => {
  it('requires a verified session', () => {
    expect(Reflect.getMetadata('__guards__', AuditController)).toContain(
      JwtAuthGuard,
    );
  });
  it('uses the authenticated identity, ignoring client actor claims', () => {
    const write = jest.fn((event) => event);
    const controller = new AuditController({
      write,
    } as unknown as AuditService);
    const user = { id: 'member-1', roles: ['user'] } as User;
    controller.write({ user, ip: '127.0.0.1' }, {
      action: 'AI_RESPONSE',
      actor_role: 'ADMIN',
      actor_id: 'admin',
    } as { action: string });
    expect(write).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: 'member-1',
        actor_role: 'CUSTOMER',
        owner: 'client',
      }),
    );
  });
});
