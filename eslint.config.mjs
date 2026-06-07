// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'scripts', '.dependency-cruiser.cjs'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "MemberExpression[object.name='process'][property.name='env']",
        message: 'process.env je povolen jen v src/core/config.ts — konfiguraci čti přes @/core.',
      }],
    },
  },
  {
    files: ['src/core/config.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
);
