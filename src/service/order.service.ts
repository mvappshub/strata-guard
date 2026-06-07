import type { Order, OrderItem } from '@/domain';
import { findOrdersByUser, findUser, saveOrder } from '@/repository';

let nextOrderId = 1;

export function isPending(order: Order): boolean {
  return order.status === 'pending';
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
