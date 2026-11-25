import { ArrowUpDown, Search, X } from 'lucide-react';
import {
  CATEGORIES,
  type CategoryFilter,
  type SortOption,
  type StatusFilter,
} from '../types/todo';

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  categoryFilter: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const STATUS_OPTIONS: StatusFilter[] = ['All', 'Active', 'Completed'];
const CATEGORY_OPTIONS: CategoryFilter[] = ['All', ...CATEGORIES];

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
}: TaskToolbarProps) {
  return (
    <div className="mb-5 space-y-4 rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A0303]/60"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or description..."
            aria-label="Search tasks"
            className="min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] py-2 pl-10 pr-9 text-sm text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8A0303]/70 hover:bg-[#B0D4E3]/50 hover:text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative shrink-0 sm:w-56">
          <ArrowUpDown
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A0303]/70"
            aria-hidden="true"
          />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort tasks"
            className="min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] py-2 pl-10 pr-3 text-sm font-medium text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
          >
            <option value="newest" className="bg-[#FFF7DF] text-[#8A0303]">
              Newest First
            </option>
            <option value="due_date" className="bg-[#FFF7DF] text-[#8A0303]">
              Due Date
            </option>
            <option value="priority" className="bg-[#FFF7DF] text-[#8A0303]">
              Priority: High to Low
            </option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#7EB2C7]/50 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex flex-wrap items-center gap-1.5"
        >
          {STATUS_OPTIONS.map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={`min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
                  active
                    ? 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                    : 'border-[#7EB2C7]/60 bg-[#FFFDF5] text-[#8A0303]/80 hover:border-[#7EB2C7] hover:bg-[#B0D4E3]/35 hover:text-[#8A0303]'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Filter by category"
          className="inline-flex flex-wrap items-center gap-1.5"
        >
          {CATEGORY_OPTIONS.map((category) => {
            const active = categoryFilter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
                  active
                    ? 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                    : 'border-[#7EB2C7]/60 bg-[#FFFDF5] text-[#8A0303]/80 hover:border-[#7EB2C7] hover:bg-[#B0D4E3]/35 hover:text-[#8A0303]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
