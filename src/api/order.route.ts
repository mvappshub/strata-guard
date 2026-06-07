import { createOrder, listOrders } from '@/service';
import type { OrderItem } from '@/domain';

export async function handleCreateOrder(
  userId: string,
  items: OrderItem[],
): Promise<{ status: number; body: string }> {
  try {
    const order = await createOrder(userId, items);
    return { status: 201, body: JSON.stringify(order) };
  } catch (e) {
    return { status: 400, body: (e as Error).message };
  }
}

export async function handleListOrders(
  userId: string,
): Promise<{ status: number; body: string }> {
  const orders = await listOrders(userId);
  return { status: 200, body: JSON.stringify(orders) };
}
