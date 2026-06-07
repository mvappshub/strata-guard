import { describe, it, expect } from 'vitest';
import { findUser } from '@/repository';

describe('user.repository', () => {
  it('najde uživatele', async () => {
    expect((await findUser('1')).name).toBe('Ada');
  });
});
