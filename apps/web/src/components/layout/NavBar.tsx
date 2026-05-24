import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Button, LinkButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/features/auth/api';
import { useStreak } from '@/features/streaks/hooks';

interface NavItem {
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: 'Horóscopo', to: '/horoscopo/diario' },
  { label: 'Tarot', to: '/tarot/simple' },
  { label: 'Carta natal', to: '/carta-natal/basica' },
  { label: 'Premium', to: '/premium' },
];

export function NavBar() {
  const { scrolled } = useScrollDirection(80);
  const { session } = useAuth();
  const { data: streak } = useStreak();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const streakDays = streak?.current_streak ?? 0;

  async function onLogout() {
    await signOut();
    setOpen(false);
    navigate('/', { replace: true });
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        'border-b backdrop-blur-md',
        scrolled
          ? 'border-slate-200 bg-white/85 shadow-sm'
          : 'border-transparent bg-white/70',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8',
          'transition-all duration-200',
          scrolled ? 'h-14' : 'h-16 md:h-18',
        )}
      >
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl text-ink"
          aria-label="Zodiaq, inicio"
        >
          <span
            aria-hidden="true"
            className="text-2xl bg-gradient-to-br from-cosmos-600 via-aurora-500 to-gold-500 bg-clip-text text-transparent"
          >
            ✦
          </span>
          <span>Zodiaq</span>
          <Badge tone="cosmos" className="ml-1 hidden sm:inline-flex">
            beta
          </Badge>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'text-cosmos-700 bg-cosmos-50'
                    : 'text-graphite hover:bg-mist hover:text-ink',
                  item.to === '/premium' && !isActive && 'text-gold-600',
                )
              }
            >
              {item.label === 'Premium' ? (
                <span className="flex items-center gap-1">
                  <span aria-hidden="true">✨</span>
                  {item.label}
                </span>
              ) : (
                item.label
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              {streakDays > 0 && (
                <span
                  title={`Racha de ${streakDays} día${streakDays === 1 ? '' : 's'}`}
                  className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-sm font-semibold text-gold-600"
                >
                  <span aria-hidden="true">🔥</span>
                  {streakDays}
                </span>
              )}
              <LinkButton to="/perfil" variant="secondary" size="sm">
                Mi perfil
              </LinkButton>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">
                Iniciar sesión
              </LinkButton>
              <LinkButton to="/registro" variant="primary" size="sm">
                Registrarse
              </LinkButton>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </Button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <nav aria-label="Móvil" className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-3 text-base font-medium',
                      isActive
                        ? 'text-cosmos-700 bg-cosmos-50'
                        : 'text-graphite hover:bg-mist',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {session ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <LinkButton
                  to="/perfil"
                  variant="secondary"
                  fullWidth
                  className=""
                >
                  Mi perfil
                </LinkButton>
                <Button variant="ghost" fullWidth onClick={onLogout}>
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <LinkButton to="/login" variant="secondary" fullWidth>
                  Iniciar sesión
                </LinkButton>
                <LinkButton to="/registro" variant="primary" fullWidth>
                  Registrarse
                </LinkButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
