// web/src/providers/index.tsx (تصحيح PostHog Provider)
'use client';

import { createContext, useContext } from 'react';
import { SupabaseProvider } from './supabase-provider';
import { PostHogContextProvider } from './posthog-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <PostHogContextProvider>
        {children}
      </PostHogContextProvider>
    </SupabaseProvider>
  );
}
