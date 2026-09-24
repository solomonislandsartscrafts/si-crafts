import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// Next.js 16 removed `next lint`, so the project lints with the ESLint CLI
// against this flat config. `eslint-config-next` still ships its rules in the
// legacy (eslintrc) shape, so FlatCompat bridges them into flat config.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    // Build output, generated assets and non-app code — never linted.
    ignores: [
      '.next/**',
      '.open-next/**',
      'node_modules/**',
      'public/**',
      'backend/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // A leading underscore marks a binding that is intentionally unused —
      // e.g. a property destructured only to omit it from the rest object.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];

export default config;
