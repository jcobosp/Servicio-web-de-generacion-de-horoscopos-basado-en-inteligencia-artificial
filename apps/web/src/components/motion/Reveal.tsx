import { motion, useReducedMotion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 44 },
  down: { x: 0, y: -44 },
  left: { x: 44, y: 0 },
  right: { x: -44, y: 0 },
  none: { x: 0, y: 0 },
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealProps {
  children: ReactNode;
  /** Dirección desde la que entra. */
  direction?: Direction;
  delay?: number;
  /** Porción visible para disparar (0–1). */
  amount?: number;
  once?: boolean;
  className?: string;
}

/**
 * Revela su contenido con una animación al entrar en el viewport (scroll). Si
 * el usuario prefiere movimiento reducido, no anima (contenido visible directo).
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  amount = 0.3,
  once = true,
  className,
}: RevealProps) {
  const reduce = useReducedMotion();
  const o = OFFSET[direction];

  const motionProps: MotionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, x: o.x, y: o.y },
        whileInView: { opacity: 1, x: 0, y: 0 },
        viewport: { once, amount },
        transition: { duration: 0.9, delay, ease: EASE },
      };

  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
}

interface RevealStaggerProps {
  children: ReactNode;
  stagger?: number;
  amount?: number;
  once?: boolean;
  className?: string;
}

/**
 * Contenedor que revela a sus `<RevealItem>` hijos en cascada al entrar en el
 * viewport. Combínalo con `<RevealItem>` para listas/grids de cards.
 */
export function RevealStagger({
  children,
  stagger = 0.14,
  amount = 0.2,
  once = true,
  className,
}: RevealStaggerProps) {
  const reduce = useReducedMotion();

  const motionProps: MotionProps = reduce
    ? {}
    : {
        initial: 'hidden',
        whileInView: 'show',
        viewport: { once, amount },
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: stagger } },
        },
      };

  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 44 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

interface RevealItemProps {
  children: ReactNode;
  className?: string;
}

/** Hijo animado de `<RevealStagger>`. */
export function RevealItem({ children, className }: RevealItemProps) {
  const reduce = useReducedMotion();
  const motionProps: MotionProps = reduce ? {} : { variants: ITEM_VARIANTS };

  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
}
