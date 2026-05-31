import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { buildRobotsTxt, buildSitemapXml } from './src/lib/seo-routes';

/**
 * Genera `sitemap.xml` y `robots.txt` en la raíz del build a partir de las
 * rutas indexables (`src/lib/seo-routes.ts`). El sitemap usa la fecha del build
 * como `<lastmod>`; ambos toman la URL base de `VITE_SITE_URL` (en local,
 * localhost). Ver `docs/SEO_STRATEGY.md` §5.
 */
function seoFilesPlugin(siteUrl: string): Plugin {
  return {
    name: 'zodiaq-seo-files',
    apply: 'build',
    generateBundle() {
      const lastmod = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: buildSitemapXml(siteUrl, lastmod),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: buildRobotsTxt(siteUrl),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = env.VITE_SITE_URL || 'http://localhost:5173';

  return {
    plugins: [react(), tailwindcss(), seoFilesPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Separa las dependencias grandes en chunks de vendor cacheables por
          // separado, para aligerar el bundle inicial y mejorar el cacheo.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('react-router') || id.includes('/react-router-dom/'))
              return 'vendor-router';
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('react-helmet-async') ||
              id.includes('/scheduler/')
            )
              return 'vendor-react';
            return 'vendor';
          },
        },
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
  };
});
