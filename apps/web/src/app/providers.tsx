import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </HelmetProvider>
  );
}
