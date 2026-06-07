import { handleListOrders } from '@/api';

export async function renderOrders(userId: string): Promise<string> {
  const res = await handleListOrders(userId);
  return `<section>${res.body}</section>`;
}
