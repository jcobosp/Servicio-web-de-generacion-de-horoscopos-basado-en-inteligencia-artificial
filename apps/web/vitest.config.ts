import { defineConfig } from 'vitest/config';

// Configuración mínima de Vitest, aislada de `vite.config.ts` (que incluye el
// plugin de generación de SEO solo para `build`). Los tests cubren funciones
// puras de dominio, así que basta el entorno `node` (sin DOM ni mocks).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
