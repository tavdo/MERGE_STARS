import { OrdersService } from './orders.service';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../database/entities/order.entity';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { User } from '../../database/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';

describe('Brand House offer enforcement', () => {
  const transaction = jest.fn();
  const service = new OrdersService(
    {} as Repository<Order>,
    {} as Repository<CoinApplication>,
    {} as WalletService,
    { transaction } as unknown as DataSource,
  );
  beforeEach(() => transaction.mockClear());
  it.each(['bank', 'full', 'earnings'])(
    'rejects obsolete quote payment through %s before any debit',
    async (method) => {
      await expect(
        service.createForApplication({ id: 'house' } as User, 'APP-1', method),
      ).rejects.toThrow('locked CORE pricing snapshot');
      expect(transaction).not.toHaveBeenCalled();
    },
  );
  it('prevents admin payment confirmation from bypassing the offer requirement', async () => {
    await expect(service.markOrderPaid('ORD-1')).rejects.toThrow(
      'verified Brand House'.replace('verified', 'Verified'),
    );
    expect(transaction).not.toHaveBeenCalled();
  });
  it('returns no invented courier, tracking number or estimated delivery', async () => {
    const row = {
      id: '1',
      publicId: 'ORD-1',
      status: 'shipped',
      amount: 20,
      createdAt: new Date(),
      deliveryStatus: 'pending',
    } as Order;
    const reader = new OrdersService(
      { find: async () => [row] } as unknown as Repository<Order>,
      {} as Repository<CoinApplication>,
      {} as WalletService,
      {} as DataSource,
    );
    expect((await reader.listForUser('house'))[0]).toMatchObject({
      trackingCode: null,
      courier: null,
      estDeliveryAt: null,
    });
  });
});
