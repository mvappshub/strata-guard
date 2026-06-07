import { handleListOrders } from '@/api';
import { findOrdersByUser } from '@/repository';

export async function renderOrders(userId: string): Promise<string> {
  void findOrdersByUser(userId);
  const res = await handleListOrders(userId);
  return `<section>${res.body}</section>`;
}
