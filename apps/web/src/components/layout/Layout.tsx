import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { PageTransition } from './PageTransition';
import { DemoBanner } from './DemoBanner';
import { ToastViewport } from '@/components/ui/Toast';
import { CookieBanner } from '@/features/legal/CookieBanner';
import { CookiePreferences } from '@/features/legal/CookiePreferences';
import { ConsentScripts } from '@/features/legal/ConsentScripts';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <DemoBanner />
      <NavBar />
      <main id="main" className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <ToastViewport />
      <CookieBanner />
      <CookiePreferences />
      <ConsentScripts />
    </div>
  );
}
