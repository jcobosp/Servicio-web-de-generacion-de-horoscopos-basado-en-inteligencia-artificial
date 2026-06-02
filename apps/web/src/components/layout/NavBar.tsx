import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { ChevronDown, Flame, Menu, Sparkles, X } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Button, LinkButton } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/api';
import { useStreak } from '@/features/streaks/hooks';
import { prefetchRoute } from '@/app/route-prefetch';

interface NavItem {
  label: string;
  to: string;
}

const mainItems: NavItem[] = [
  { label: 'Horóscopo', to: '/horoscopo/diario' },
  { label: 'Tarot', to: '/tarot/simple' },
  { label: 'Carta natal', to: '/carta-natal/basica' },
  { label: 'Compatibilidad', to: '/compatibilidad' },
  { label: 'Numerología', to: '/numerologia' },
];

/** Entradas agrupadas bajo el desplegable «Más». */
const moreItems: NavItem[] = [
  { label: 'Energía del día', to: '/energia-del-dia' },
  { label: 'Eventos astrológicos', to: '/eventos-astrologicos' },
  { label: 'Reportes', to: '/reportes/mensual' },
];

const premiumItem: NavItem = { label: 'Premium', to: '/premium' };

/** Enlace de escritorio con subrayado animado (compartido por `layoutId`). */
function DesktopNavLink({
  item,
  reduce,
}: {
  item: NavItem;
  reduce: boolean | null;
}) {
  const isPremium = item.to === '/premium';
  return (
    <NavLink
      to={item.to}
      onMouseEnter={() => prefetchRoute(item.to)}
      onFocus={() => prefetchRoute(item.to)}
      className="relative rounded-lg px-3 py-2 text-base font-semibold transition"
    >
      {({ isActive }) => (
        <span
          className={cn(
            'relative z-10 flex items-center gap-1',
            isPremium
              ? isActive
                ? 'text-gold-600'
                : 'text-gold-600 hover:text-gold-500'
              : isActive
                ? 'text-cosmos-700'
                : 'text-graphite hover:text-ink',
          )}
        >
          {isPremium && (
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
          )}
          {item.label}
          {isActive &&
            (reduce ? (
              <span
                className={cn(
                  'absolute -bottom-1.5 left-0 right-0 mx-auto h-0.5 w-5 rounded-full bg-gradient-to-r',
                  isPremium ? 'from-gold-400 to-gold-600' : 'from-cosmos-600 to-aurora-500',
                )}
              />
            ) : (
              <motion.span
                layoutId="nav-underline"
                className={cn(
                  'absolute -bottom-1.5 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r',
                  isPremium ? 'from-gold-400 to-gold-600' : 'from-cosmos-600 to-aurora-500',
                )}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ))}
        </span>
      )}
    </NavLink>
  );
}

/** Desplegable «Más» (hover/focus, sin estado) con rutas secundarias. */
function MoreDropdown() {
  return (
    <div className="group/more relative">
      <button
        type="button"
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-base font-semibold text-graphite transition hover:text-ink group-focus-within/more:text-ink"
      >
        Más
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200 group-hover/more:rotate-180 group-focus-within/more:rotate-180"
          aria-hidden="true"
        />
      </button>
      <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-all duration-150 group-hover/more:visible group-hover/more:opacity-100 group-focus-within/more:visible group-focus-within/more:opacity-100">
        <div className="min-w-[15rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-lift">
          {moreItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={({ isActive }) =>
                cn(
                  'block rounded-xl px-3 py-2.5 text-base font-semibold transition',
                  isActive
                    ? 'bg-cosmos-50 text-cosmos-700'
                    : 'text-graphite hover:bg-mist hover:text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Enlace del menú móvil (incluye estilo premium opcional). */
function MobileLink({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const isPremium = item.to === '/premium';
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-xl px-3 py-3 text-base font-medium',
          isActive ? 'bg-cosmos-50 text-cosmos-700' : 'text-graphite hover:bg-mist',
          isPremium && 'text-gold-600',
        )
      }
    >
      {isPremium && (
        <Sparkles className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
      )}
      {item.label}
    </NavLink>
  );
}

export function NavBar() {
  const { scrolled } = useScrollDirection(80);
  const { session } = useAuth();
  const { data: streak } = useStreak();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const streakDays = streak?.current_streak ?? 0;

  const menuMotion: MotionProps = reduce
    ? { initial: false }
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: 'auto', opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      };

  async function onLogout() {
    await signOut();
    setOpen(false);
    navigate('/', { replace: true });
  }

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-2 sm:px-4 sm:pt-3 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            'flex items-center justify-between rounded-2xl border px-4 backdrop-blur-xl transition-all duration-300 sm:px-6',
            scrolled
              ? 'border-slate-200/80 bg-white/85 shadow-lift'
              : 'border-slate-200/60 bg-white/75 shadow-soft',
            scrolled ? 'h-14' : 'h-16 md:h-18',
          )}
        >
          <Logo to="/" size="md" />

        {/* Navegación escritorio */}
        <nav aria-label="Principal" className="hidden items-center gap-0.5 lg:flex">
          {mainItems.map((item) => (
            <DesktopNavLink key={item.to} item={item} reduce={reduce} />
          ))}
          <MoreDropdown />
          <DesktopNavLink item={premiumItem} reduce={reduce} />
        </nav>

        {/* Acciones escritorio */}
        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              {streakDays > 0 && (
                <span
                  title={`Racha de ${streakDays} día${streakDays === 1 ? '' : 's'}`}
                  className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-sm font-semibold text-gold-600"
                >
                  <Flame className="h-4 w-4" aria-hidden="true" />
                  {streakDays}
                </span>
              )}
              <LinkButton to="/perfil" variant="secondary" size="sm">
                Mi perfil
              </LinkButton>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">
                Iniciar sesión
              </LinkButton>
              <LinkButton to="/registro" variant="primary" size="sm">
                Empezar gratis
              </LinkButton>
            </>
          )}
        </div>

        {/* Botón menú móvil */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menú móvil animado */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-menu"
            {...menuMotion}
            className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:hidden"
          >
            <div className="px-4 py-4 sm:px-6">
              <nav aria-label="Móvil" className="flex flex-col gap-1">
                {mainItems.map((item) => (
                  <MobileLink key={item.to} item={item} onClose={closeMenu} />
                ))}
                <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.14em] text-silver">
                  Más
                </p>
                {moreItems.map((item) => (
                  <MobileLink key={item.to} item={item} onClose={closeMenu} />
                ))}
                <MobileLink item={premiumItem} onClose={closeMenu} />
              </nav>
              {session ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <LinkButton to="/perfil" variant="secondary" fullWidth onClick={() => setOpen(false)}>
                    Mi perfil
                  </LinkButton>
                  <Button variant="ghost" fullWidth onClick={onLogout}>
                    Salir
                  </Button>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <LinkButton to="/login" variant="secondary" fullWidth onClick={() => setOpen(false)}>
                    Iniciar sesión
                  </LinkButton>
                  <LinkButton to="/registro" variant="primary" fullWidth onClick={() => setOpen(false)}>
                    Empezar gratis
                  </LinkButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </header>
  );
}
