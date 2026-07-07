import { globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * ESLint 設定：自訂規則 + Next.js 官方建議 + Prettier 分工
 *
 * 原則：
 * - ESLint 管「可能出錯、可讀性、React/Next.js 慣例」
 * - Prettier 管「格式化」，包含 TS/TSX/CSS/JSON/MD
 * - 不使用 @antfu/eslint-config，避免專案風格被 preset 黑箱接管
 */
const eslintConfig = [
  globalIgnores([
    '.next/**',
    'coverage/**',
    'node_modules/**',
    'out/**',
    'public/**',
    'next-env.d.ts',
    'tsconfig.tsbuildinfo',
  ]),
  ...nextVitals,
  ...nextTypescript,
  {
    name: 'project/readability-rules',
    rules: {
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react/jsx-boolean-value': ['warn', 'never'],
    },
  },
  prettier,
]

export default eslintConfig
