import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '.coverage',
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.js',
        'app.js',
        'top.html',
      ],
    },
  },
});
