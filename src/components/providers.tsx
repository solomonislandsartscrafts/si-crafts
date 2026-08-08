'use client';

import { ToastProvider } from '@/components/ui/toast';
import type { ReactNode } from 'react';

/**
 * Client-side providers wrapper.
 * Keeps the root layout as a server component while providing
 * client-only context (toast notifications, etc.) to the tree.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
