// web/src/providers/index.tsx
'use client';

import { PostHogProvider } from './posthog-provider';
import { SupabaseProvider } from './supabase-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </SupabaseProvider>
  );
}

