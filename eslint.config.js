import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
})

export default defineConfig([
  ...compat.extends('next/core-web-vitals'),
  js.configs.recommended,
  globalIgnores(['dist', '.next']),
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
