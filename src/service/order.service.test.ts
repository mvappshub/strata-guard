import { describe, it, expect } from 'vitest';
import { createOrder, orderTotal } from '@/service';

describe('order.service (kontrakt na hranici)', () => {
  it('orderTotal sečte dvě položky v CZK', () => {
    const order = {
      id: 'o1',
      userId: '1',
      items: [
        { sku: 'a', priceCents: 100, qty: 2 },
        { sku: 'b', priceCents: 50, qty: 1 },
      ],
      status: 'pending' as const,
    };
    expect(orderTotal(order)).toEqual({ amountCents: 250, currency: 'CZK' });
  });

  it('createOrder odmítne prázdné items', async () => {
    await expect(createOrder('1', [])).rejects.toThrow();
  });

  it('createOrder odmítne neexistujícího uživatele', async () => {
    await expect(
      createOrder('999', [{ sku: 'x', priceCents: 100, qty: 1 }]),
    ).rejects.toThrow();
  });
});
