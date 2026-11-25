import { AlertTriangle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
  onOpenConfig?: () => void;
}

export function ErrorBanner({ message, onDismiss, onOpenConfig }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-[#660000] bg-[#8A0303] px-4 py-3.5 text-[#FFFDF5]"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FFFDF5]" aria-hidden="true" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Supabase Error</p>
          <p className="text-[#FFFDF5]/90 leading-relaxed">{message}</p>
          {onOpenConfig && (
            <button
              type="button"
              onClick={onOpenConfig}
              className="mt-1 inline-flex items-center text-xs font-semibold underline underline-offset-4 hover:text-[#B0D4E3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              Check Supabase Connection
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="rounded-lg p-1.5 text-[#FFFDF5] transition-colors duration-150 hover:bg-[#660000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
