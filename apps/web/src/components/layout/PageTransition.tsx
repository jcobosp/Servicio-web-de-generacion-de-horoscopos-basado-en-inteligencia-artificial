import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Transición de entrada al cambiar de ruta: cada página aparece con un fundido
 * + leve desplazamiento. No usa `AnimatePresence` (las rutas lazy + Suspense
 * desmontan el saliente al instante, lo que rompe las animaciones de salida);
 * en su lugar remonta por `key={pathname}` y anima solo la entrada. No-op con
 * `prefers-reduced-motion`.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
