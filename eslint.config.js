import globals from 'globals';
import js from '@eslint/js';
import astroParser from 'astro-eslint-parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx}'],
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
        parser: 'espree',
        extraFileExtensions: ['.astro'],
        sourceType: 'module'
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error'
    },
  },
];
