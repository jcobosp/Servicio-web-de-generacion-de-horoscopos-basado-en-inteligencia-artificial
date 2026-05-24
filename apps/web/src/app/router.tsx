/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const SignInPage = lazy(() =>
  import('@/pages/auth/SignInPage').then((m) => ({ default: m.SignInPage })),
);
const SignUpPage = lazy(() =>
  import('@/pages/auth/SignUpPage').then((m) => ({ default: m.SignUpPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const DailyHoroscopePage = lazy(() =>
  import('@/pages/horoscope/DailyHoroscopePage').then((m) => ({
    default: m.DailyHoroscopePage,
  })),
);
const WeeklyHoroscopePage = lazy(() =>
  import('@/pages/horoscope/WeeklyHoroscopePage').then((m) => ({
    default: m.WeeklyHoroscopePage,
  })),
);
const MonthlyHoroscopePage = lazy(() =>
  import('@/pages/horoscope/MonthlyHoroscopePage').then((m) => ({
    default: m.MonthlyHoroscopePage,
  })),
);
const EnergyOfDayPage = lazy(() =>
  import('@/pages/EnergyOfDayPage').then((m) => ({ default: m.EnergyOfDayPage })),
);
const DataPrivacyPage = lazy(() =>
  import('@/pages/DataPrivacyPage').then((m) => ({ default: m.DataPrivacyPage })),
);
const LegalNoticePage = lazy(() =>
  import('@/pages/legal/LegalNoticePage').then((m) => ({
    default: m.LegalNoticePage,
  })),
);
const PrivacyPolicyPage = lazy(() =>
  import('@/pages/legal/PrivacyPolicyPage').then((m) => ({
    default: m.PrivacyPolicyPage,
  })),
);
const TermsPage = lazy(() =>
  import('@/pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const CookiePolicyPage = lazy(() =>
  import('@/pages/legal/CookiePolicyPage').then((m) => ({
    default: m.CookiePolicyPage,
  })),
);

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-silver">Cargando...</div>
    </div>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

function protect(node: ReactNode) {
  return withSuspense(<ProtectedRoute>{node}</ProtectedRoute>);
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },

      // Horóscopos (gratuitos, públicos)
      { path: 'horoscopo/diario', element: withSuspense(<DailyHoroscopePage />) },
      { path: 'horoscopo/diario/:sign', element: withSuspense(<DailyHoroscopePage />) },
      { path: 'horoscopo/semanal', element: withSuspense(<WeeklyHoroscopePage />) },
      { path: 'horoscopo/semanal/:sign', element: withSuspense(<WeeklyHoroscopePage />) },
      { path: 'horoscopo/mensual', element: withSuspense(<MonthlyHoroscopePage />) },
      { path: 'horoscopo/mensual/:sign', element: withSuspense(<MonthlyHoroscopePage />) },
      { path: 'energia-del-dia', element: withSuspense(<EnergyOfDayPage />) },
      { path: 'energia-del-dia/:sign', element: withSuspense(<EnergyOfDayPage />) },

      // Autenticación
      { path: 'login', element: withSuspense(<SignInPage />) },
      { path: 'registro', element: withSuspense(<SignUpPage />) },
      { path: 'recuperar-contrasena', element: withSuspense(<ForgotPasswordPage />) },
      { path: 'restablecer-contrasena', element: withSuspense(<ResetPasswordPage />) },

      // Cuenta (protegidas)
      { path: 'perfil', element: protect(<ProfilePage />) },
      { path: 'perfil/datos', element: protect(<DataPrivacyPage />) },

      // Legales
      { path: 'aviso-legal', element: withSuspense(<LegalNoticePage />) },
      {
        path: 'politica-de-privacidad',
        element: withSuspense(<PrivacyPolicyPage />),
      },
      {
        path: 'terminos-y-condiciones',
        element: withSuspense(<TermsPage />),
      },
      {
        path: 'politica-de-cookies',
        element: withSuspense(<CookiePolicyPage />),
      },

      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
