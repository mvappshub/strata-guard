import type { Order } from '@/domain';

const orders = new Map<string, Order>();

export async function saveOrder(order: Order): Promise<void> {
  orders.set(order.id, order);
}

export async function findOrdersByUser(userId: string): Promise<Order[]> {
  return [...orders.values()].filter((o) => o.userId === userId);
}
