import { describe, it, expect } from 'vitest';
import { getUserGreeting } from '@/service';

describe('user.service (kontrakt na hranici)', () => {
  it('vrací pozdrav podle jména', () => {
    expect(getUserGreeting({ id: '1', name: 'Ada' })).toBe('Ahoj, Ada');
  });
});
