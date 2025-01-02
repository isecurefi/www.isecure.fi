import globals from 'globals';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
    },
  },
  {
    files: ['**/*.astro'],
    plugins: {},
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
    },
    rules: {},
  },
];
