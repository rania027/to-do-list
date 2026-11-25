import { RotateCcw, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  isRestoring: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ message, isRestoring, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] px-4 py-3 text-[#8A0303]"
    >
      <p className="text-sm font-medium text-[#8A0303]">{message}</p>
      <button
        type="button"
        onClick={onUndo}
        disabled={isRestoring}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-3 py-1.5 text-xs font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{isRestoring ? 'Restoring...' : 'Undo'}</span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-lg p-1.5 text-[#8A0303]/70 transition-colors duration-150 hover:bg-[#B0D4E3]/40 hover:text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
