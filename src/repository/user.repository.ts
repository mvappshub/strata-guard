import type { User } from '@/domain';

const db = new Map<string, User>([['1', { id: '1', name: 'Ada' }]]);

export async function findUser(id: string): Promise<User> {
  const u = db.get(id);
  if (!u) throw new Error(`User ${id} nenalezen`);
  return u;
}
