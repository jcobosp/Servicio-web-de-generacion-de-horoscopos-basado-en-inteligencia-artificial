import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { ToastViewport } from '@/components/ui/Toast';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastViewport />
    </div>
  );
}
