import antfu from '@antfu/eslint-config';

export default antfu({

  unocss: true,

  // Or customize the stylistic rules
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
    semi: true,
  },

  // Enforce single attribute per line in HTML, Vue and JSX.
  // singleAttributePerLine: true,

  // TypeScript and Vue are auto-detected, you can also explicitly enable them:
  typescript: true,
  vue: true,

  rules: {
    'curly': ['error', 'all'],
    'no-console': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.object.name=\'console\'][callee.property.name!=/^(log|warn|error|info|trace)$/]',
        message: 'Unexpected property on console object was called',
      },
    ],
    'style/max-statements-per-line': ['error', { max: 2 }],
    'unused-imports/no-unused-imports': ['error'],
    'vue/max-attributes-per-line': ['error', {
      singleline: { max: 1 },
      multiline: { max: 1 },
    }],
    'tailwindcss/classnames-order': 'error',
  },
});