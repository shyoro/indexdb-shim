import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/indexdb-shim.ts'),
      name: 'IndexdbShim',
      fileName: (format) => `indexdb-shim.${format === 'es' ? 'js' : 'cjs'}`
    },
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true, // <-- Ensures 'types' field in package.json points to the right place
      outDir: 'dist', // <-- Make sure types are generated inside the 'dist' folder
      rollupTypes: true, // <-- Ensures types are bundled properly
    }),
  ],
});