import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';

export default defineConfig({
  input: './src/index.ts',
  output: [
    {
      file: './dist/index.cjs',
      format: 'cjs',
    },
    {
      file: './dist/index.js',
      format: 'esm',
    },
  ],
  plugins: [typescript(), del({ targets: './dist/*' })],
});
