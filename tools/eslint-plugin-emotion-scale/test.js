const { RuleTester } = require('eslint');
const plugin = require('./index.cjs');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

tester.run('no-emotion-mis-scaling', plugin.rules['no-emotion-mis-scaling'], {
  valid: [
    { code: 'formatPercentage(position * 100)' },
    { code: 'toPercentDisplay(position)' },
    { code: 'renderPercent(position * 100)' },
    { code: 'const x = intensity; // 0–100 OK' },
  ],
  invalid: [
    { code: 'const x = intensity * 100;', errors: [{ messageId: 'misScale' }] },
    {
      code: 'const y = 100 / confidence;',
      errors: [{ messageId: 'misScale' }],
    },
    {
      code: 'const z = curve[i].tension / 100;',
      errors: [{ messageId: 'misScale' }],
    },
  ],
});
