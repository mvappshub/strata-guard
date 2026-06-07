import { handleGetGreeting } from '@/api';

export async function renderUserPage(id: string): Promise<string> {
  const res = await handleGetGreeting(id);
  return `<main>${res.body}</main>`;
}
