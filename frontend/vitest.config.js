import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js', './src/__tests__/setupTests.js'],
    include: [
      'src/**/*.{test,spec}.{js,jsx}',
      'src/integration-tests/**/*.{test,spec}.{js,jsx}'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/setup.js',
        'src/__tests__/setupTests.js'
      ]
    }
  }
}); 