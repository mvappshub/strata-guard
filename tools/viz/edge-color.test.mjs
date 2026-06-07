import { describe, expect, it } from 'vitest';
import { edgeStroke } from './edge-color.mjs';

describe('edgeStroke', () => {
  it('valid dependency → neutrální', () => {
    expect(edgeStroke({ valid: true })).toBe('#484f58');
  });

  it('error severity → červená', () => {
    expect(edgeStroke({ valid: false, rules: [{ severity: 'error', name: 'ui-only-down' }] })).toBe('#f85149');
  });

  it('warn severity → oranžová', () => {
    expect(edgeStroke({ valid: false, rules: [{ severity: 'warn', name: 'no-orphans' }] })).toBe('#d29922');
  });
});
