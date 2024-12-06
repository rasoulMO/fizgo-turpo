/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
module.exports = {
  endOfLine: 'lf',
  arrowParens: 'always',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 80,
  trailingComma: 'none',
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^types$',
    '^@repo/(.*)$',
    '^@/resources/(.*)$',
    '^@/config/(.*)$',
    '^@/utils/(.*)$',
    '^@/hooks/(.*)$',
    '^@/types/(.*)$',
    '^@/components/ui/(.*)$',
    '^@/components/(.*)$',
    '^@/registry/(.*)$',
    '^@/styles/(.*)$',
    '^@/app/(.*)$',
    '',
    '^[./]'
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true,
  tailwindConfig: './tailwind.config.ts',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ]
}
