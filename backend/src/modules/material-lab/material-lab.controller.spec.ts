import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MaterialLabAdminController } from './material-lab.controller';
describe('Material Lab authorization boundary', () => {
  it('requires the existing JWT and role guards for all administrative endpoints', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, MaterialLabAdminController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, MaterialLabAdminController)).toEqual([
      'admin',
    ]);
  });
});
