import type { Money, Order, OrderItem } from '@/domain';
import { findOrdersByUser, findUser, saveOrder } from '@/repository';

let nextOrderId = 1;

export function orderTotal(order: Order): Money {
  const amountCents = order.items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
  return { amountCents, currency: 'CZK' };
}

export async function createOrder(userId: string, items: OrderItem[]): Promise<Order> {
  if (items.length === 0) {
    throw new Error('Objednávka musí mít alespoň jednu položku');
  }
  await findUser(userId);
  const order: Order = {
    id: String(nextOrderId++),
    userId,
    items,
    status: 'pending',
  };
  await saveOrder(order);
  return order;
}

export async function listOrders(userId: string): Promise<Order[]> {
  return findOrdersByUser(userId);
}
