import { Trash2 } from 'lucide-react';

interface ProgressSummaryProps {
  totalCount: number;
  completedCount: number;
  isClearing: boolean;
  onClearCompleted: () => void;
}

export function ProgressSummary({
  totalCount,
  completedCount,
  isClearing,
  onClearCompleted,
}: ProgressSummaryProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section
      aria-label="Task progress"
      className="mb-8 rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[#8A0303]">
            Daily Progress
          </h2>
          <p className="mt-1 text-sm text-[#8A0303]/80">
            <span className="font-mono font-semibold tabular-nums text-[#8A0303]">
              {completedCount} of {totalCount}
            </span>{' '}
            {totalCount === 1 ? 'task' : 'tasks'} completed
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-2xl font-semibold tabular-nums text-[#8A0303]">
            {percentage}%
          </span>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              disabled={isClearing}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#8A0303] px-4 py-2 text-sm font-semibold text-[#FFFDF5] transition-colors duration-150 hover:bg-[#660000] disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>{isClearing ? 'Clearing...' : 'Clear Completed'}</span>
            </button>
          )}
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${completedCount} of ${totalCount} tasks completed`}
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#B0D4E3]"
      >
        <div
          className="h-full rounded-full bg-[#8A0303] transition-all duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
}
