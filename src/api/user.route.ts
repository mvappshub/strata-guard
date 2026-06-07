import { loadGreeting } from '@/service';

export async function handleGetGreeting(id: string): Promise<{ status: number; body: string }> {
  return { status: 200, body: await loadGreeting(id) };
}
