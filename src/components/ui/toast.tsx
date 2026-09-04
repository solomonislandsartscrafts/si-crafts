'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

// --- Types ---

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// --- Context ---

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// --- Provider ---

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Remaining time for a paused toast, so resuming continues from where it
  // left off rather than restarting the full duration.
  const remaining = useRef<Map<string, number>>(new Map());
  const startedAt = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      clearTimer(id);
      remaining.current.delete(id);
      startedAt.current.delete(id);
    },
    [clearTimer]
  );

  const startTimer = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return;
      startedAt.current.set(id, Date.now());
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
      startTimer(id, duration);
    },
    [startTimer]
  );

  // WCAG 2.2.1 Timing Adjustable: a toast that disappears on a fixed timer
  // with no way to pause or extend it fails this criterion. Hovering or
  // focusing a toast (e.g. to read it, or to tab to its dismiss button) pauses
  // the countdown; leaving resumes it with whatever time was left, not a
  // fresh duration.
  const pause = useCallback((id: string) => {
    const timer = timers.current.get(id);
    const started = startedAt.current.get(id);
    if (!timer || started === undefined) return;
    clearTimeout(timer);
    timers.current.delete(id);
    const toast = toasts.find((t) => t.id === id);
    const already = remaining.current.get(id) ?? toast?.duration ?? 0;
    const elapsed = Date.now() - started;
    remaining.current.set(id, Math.max(0, already - elapsed));
  }, [toasts]);

  const resume = useCallback((id: string) => {
    const left = remaining.current.get(id);
    if (left === undefined) return;
    // The countdown ran out while paused (e.g. the toast was held open past its
    // duration). Dismiss now rather than starting a zero-duration timer, which
    // `startTimer` would drop on the floor and leave the toast on screen. */
    if (left <= 0) {
      dismiss(id);
      return;
    }
    startTimer(id, left);
  }, [startTimer, dismiss]);

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur ?? 6000),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} onPause={pause} onResume={resume} />
    </ToastContext.Provider>
  );
}

// --- Container & Toast item ---

function ToastContainer({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-xs max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} onPause={onPause} onResume={onResume} />
      ))}
    </div>
  );
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-white text-warm-gray-800',
  error: 'border-error/30 bg-white text-warm-gray-800',
  info: 'border-ocean/30 bg-white text-warm-gray-800',
};

const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-error shrink-0" />,
  info: <Info className="w-5 h-5 text-ocean shrink-0" />,
};

function ToastItem({
  toast,
  onDismiss,
  onPause,
  onResume,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  // Hover and focus pause the countdown independently: a pointer can leave the
  // toast while keyboard focus is still inside it (or the reverse), and the
  // timer must stay paused until BOTH are gone. Tracking them as one flag let
  // whichever event fired first resume the timer while the other was still
  // active, so a toast being read via keyboard could vanish on mouse-out.
  const hovered = useRef(false);
  const focused = useRef(false);

  const enter = (which: 'hover' | 'focus') => {
    if (which === 'hover') hovered.current = true;
    else focused.current = true;
    onPause(toast.id);
  };

  const leave = (which: 'hover' | 'focus') => {
    if (which === 'hover') hovered.current = false;
    else focused.current = false;
    if (!hovered.current && !focused.current) onResume(toast.id);
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-xs px-sm py-xs rounded-lg border shadow-md animate-slide-up ${VARIANT_STYLES[toast.variant]}`}
      onMouseEnter={() => enter('hover')}
      onMouseLeave={() => leave('hover')}
      onFocus={() => enter('focus')}
      onBlur={() => leave('focus')}
    >
      {VARIANT_ICON[toast.variant]}
      <p className="text-base leading-body flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="tap-target p-3xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors shrink-0 -mr-3xs -mt-3xs"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
