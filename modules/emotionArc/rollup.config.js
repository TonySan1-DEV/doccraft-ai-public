// MCP Context Block
/*
{
  file: "modules/emotionArc/rollup.config.js",
  role: "devops",
  allowedActions: ["scaffold", "publish", "package"],
  tier: "Admin",
  contentSensitivity: "low",
  theme: "deployment"
}
*/

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime'
];

const plugins = [
  resolve({
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.build.json',
    declaration: true,
    declarationDir: './dist',
    exclude: ['**/__tests__/**', '**/__stories__/**', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx']
  })
];

const config = [
  // Main bundle
  {
    input: 'index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins
  },
  // Services bundle
  {
    input: 'services/index.ts',
    output: [
      {
        file: 'dist/services/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/services/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins
  },
  // Components bundle
  {
    input: 'components/index.ts',
    output: [
      {
        file: 'dist/components/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/components/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins
  },
  // Types bundle
  {
    input: 'types/index.ts',
    output: [
      {
        file: 'dist/types/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/types/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins
  },
  // Utils bundle
  {
    input: 'utils/index.ts',
    output: [
      {
        file: 'dist/utils/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/utils/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins
  },
  // Constants bundle
  {
    input: 'constants/index.ts',
    output: [
      {
        file: 'dist/constants/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/constants/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins
  },
  // Test utils bundle
  {
    input: 'components/__tests__/testHooks.ts',
    output: [
      {
        file: 'dist/test-utils/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/test-utils/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external: [...external, '@testing-library/react', '@testing-library/jest-dom'],
    plugins
  },
  // Stories bundle
  {
    input: 'components/__stories__/EmotionArcStories.tsx',
    output: [
      {
        file: 'dist/stories/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/stories/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external: [...external, '@storybook/react'],
    plugins
  },
  // TypeScript declaration files
  {
    input: 'index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    external,
    plugins: [dts()]
  },
  {
    input: 'services/index.ts',
    output: {
      file: 'dist/services/index.d.ts',
      format: 'esm'
    },
    external,
    plugins: [dts()]
  },
  {
    input: 'components/index.ts',
    output: {
      file: 'dist/components/index.d.ts',
      format: 'esm'
    },
    external,
    plugins: [dts()]
  },
  {
    input: 'types/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'esm'
    },
    external,
    plugins: [dts()]
  },
  {
    input: 'utils/index.ts',
    output: {
      file: 'dist/utils/index.d.ts',
      format: 'esm'
    },
    external,
    plugins: [dts()]
  },
  {
    input: 'constants/index.ts',
    output: {
      file: 'dist/constants/index.d.ts',
      format: 'esm'
    },
    external,
    plugins: [dts()]
  },
  {
    input: 'components/__tests__/testHooks.ts',
    output: {
      file: 'dist/test-utils/index.d.ts',
      format: 'esm'
    },
    external: [...external, '@testing-library/react', '@testing-library/jest-dom'],
    plugins: [dts()]
  },
  {
    input: 'components/__stories__/EmotionArcStories.tsx',
    output: {
      file: 'dist/stories/index.d.ts',
      format: 'esm'
    },
    external: [...external, '@storybook/react'],
    plugins: [dts()]
  }
];

// Production builds with minification
if (process.env.NODE_ENV === 'production') {
  config.forEach(bundle => {
    if (bundle.output && !Array.isArray(bundle.output)) {
      bundle.output = [bundle.output];
    }
    if (bundle.output && Array.isArray(bundle.output)) {
      bundle.output.forEach(output => {
        if (output.format === 'cjs' || output.format === 'esm') {
          output.file = output.file.replace('.js', '.min.js');
          bundle.plugins = [...bundle.plugins, terser()];
        }
      });
    }
  });
}

export default config; 