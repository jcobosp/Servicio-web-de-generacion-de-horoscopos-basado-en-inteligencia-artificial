/**
 * Prefetch de los chunks de las rutas principales. Al pasar el ratón o enfocar
 * un enlace de la navegación, precargamos su módulo (mismo `import()` perezoso
 * que usa el router, así que Vite reutiliza el mismo chunk) para que la
 * navegación posterior sea instantánea. Ver `docs/SEO_STRATEGY.md` §6.
 */
const ROUTE_IMPORTS: Record<string, () => Promise<unknown>> = {
  '/horoscopo/diario': () => import('@/pages/horoscope/DailyHoroscopePage'),
  '/horoscopo/semanal': () => import('@/pages/horoscope/WeeklyHoroscopePage'),
  '/horoscopo/mensual': () => import('@/pages/horoscope/MonthlyHoroscopePage'),
  '/tarot/simple': () => import('@/pages/TarotPage'),
  '/carta-natal/basica': () => import('@/pages/NatalChartPage'),
  '/compatibilidad': () => import('@/pages/SignCompatibilityPage'),
  '/numerologia': () => import('@/pages/NumerologyPage'),
  '/reportes/mensual': () => import('@/pages/ReportsPage'),
  '/premium': () => import('@/pages/PremiumPage'),
};

const prefetched = new Set<string>();

/** Precarga el chunk de la ruta indicada (idempotente). */
export function prefetchRoute(to: string): void {
  if (prefetched.has(to)) return;
  const load = ROUTE_IMPORTS[to];
  if (!load) return;
  prefetched.add(to);
  void load().catch(() => {
    // Si falla la precarga, la navegación normal volverá a intentar la carga.
    prefetched.delete(to);
  });
}
