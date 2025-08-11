const { RuleTester } = require('eslint');
const plugin = require('./index.cjs');

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

tester.run('no-emotion-mis-scaling', plugin.rules['no-emotion-mis-scaling'], {
  valid: [
    { code: 'formatPercentage(position * 100)' },
    { code: 'toPercentDisplay(position)' },
    { code: 'renderPercent(position * 100)' },
    { code: 'const x = intensity; // 0–100 OK' },
  ],
  invalid: [
    {
      code: 'const x = intensity * 100;',
      errors: [
        {
          messageId: 'removeHundred',
          suggestions: [
            {
              messageId: 'removeHundred',
              data: { name: 'intensity' },
              output: 'const x = intensity;',
            },
          ],
        },
      ],
    },
    {
      code: 'const y = 100 / confidence;',
      errors: [
        {
          messageId: 'removeHundred',
          suggestions: [
            {
              messageId: 'removeHundred',
              data: { name: 'confidence' },
              output: 'const y = confidence;',
            },
          ],
        },
      ],
    },
    {
      code: 'const z = curve[i].tension / 100;',
      errors: [
        {
          messageId: 'removeHundred',
          suggestions: [
            {
              messageId: 'removeHundred',
              data: { name: 'tension' },
              output: 'const z = curve[i].tension;',
            },
          ],
        },
      ],
    },
    {
      code: 'const pos = position * 100;',
      errors: [
        {
          messageId: 'wrapPercent',
          suggestions: [
            {
              messageId: 'wrapPercent',
              output: 'const pos = toPercentDisplay(position);',
            },
          ],
        },
      ],
    },
    {
      code: 'const display = beat.position * 100;',
      errors: [
        {
          messageId: 'wrapPercent',
          suggestions: [
            {
              messageId: 'wrapPercent',
              output: 'const display = toPercentDisplay(beat.position);',
            },
          ],
        },
      ],
    },
  ],
});
