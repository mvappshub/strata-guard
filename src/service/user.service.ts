import type { User } from '@/domain';
import { config } from '@/core';
import { findUser } from '@/repository';

export function getUserGreeting(user: User): string {
  return `${config.greetingPrefix}, ${user.name}`;
}

export async function loadGreeting(id: string): Promise<string> {
  const user = await findUser(id);
  return getUserGreeting(user);
}
