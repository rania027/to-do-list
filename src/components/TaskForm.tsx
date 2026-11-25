import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Calendar, Plus } from 'lucide-react';
import {
  CATEGORIES,
  PRIORITIES,
  type Category,
  type NewTodoInput,
  type Priority,
} from '../types/todo';
import { getTodayISO, getTomorrowISO } from '../lib/dateUtils';

interface TaskFormProps {
  onAddTask: (input: NewTodoInput) => Promise<boolean>;
  isSubmitting: boolean;
  disabled: boolean;
}

export function TaskForm({ onAddTask, isSubmitting, disabled }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState<Category>('Personal');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const submitForm = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Please enter a task title.');
      return;
    }
    setValidationError(null);

    const success = await onAddTask({
      title: trimmedTitle,
      description: description.trim() ? description.trim() : null,
      priority,
      category,
      due_date: dueDate ? dueDate : null,
    });

    if (success) {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('Personal');
      setDueDate('');
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitForm();
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submitForm();
    }
  };

  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();

  return (
    <aside className="rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[#8A0303]">
        New Task
      </h2>
      <p className="mt-1 text-sm text-[#8A0303]/70">
        Capture what matters next and press Enter to save.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="new-task-title" className="block text-sm font-semibold text-[#8A0303]">
            Title
          </label>
          <input
            id="new-task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onKeyDown={handleTitleKeyDown}
            placeholder="Draft quarterly project outline..."
            disabled={disabled || isSubmitting}
            className="mt-1.5 min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3.5 py-2 text-sm text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] disabled:opacity-60"
          />
          {validationError && (
            <p className="mt-1.5 text-xs font-medium text-[#8A0303]">{validationError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="new-task-description"
            className="block text-sm font-semibold text-[#8A0303]"
          >
            Description <span className="font-normal text-[#8A0303]/60">(optional)</span>
          </label>
          <textarea
            id="new-task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, links, or next steps..."
            disabled={disabled || isSubmitting}
            className="mt-1.5 w-full resize-none rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3.5 py-2.5 text-sm text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] disabled:opacity-60"
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-[#8A0303]">Priority</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {PRIORITIES.map((item) => {
              const isSelected = priority === item;
              const isHigh = item === 'High';
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPriority(item)}
                  disabled={disabled || isSubmitting}
                  className={`min-h-[40px] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
                    isSelected
                      ? isHigh
                        ? 'border-[#8A0303] bg-[#8A0303] text-[#FFFDF5]'
                        : 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                      : 'border-[#7EB2C7] bg-[#FFFDF5] text-[#8A0303] hover:bg-[#B0D4E3]/40'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="new-task-category" className="block text-sm font-semibold text-[#8A0303]">
            Category
          </label>
          <select
            id="new-task-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={disabled || isSubmitting}
            className="mt-1.5 min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3.5 py-2 text-sm font-medium text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] disabled:opacity-60"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#FFF7DF] text-[#8A0303]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="new-task-due" className="block text-sm font-semibold text-[#8A0303]">
              Due Date <span className="font-normal text-[#8A0303]/60">(optional)</span>
            </label>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A0303]/70"
                aria-hidden="true"
              />
              <input
                id="new-task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={disabled || isSubmitting}
                className="min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] py-2 pl-9 pr-3 font-mono text-sm tabular-nums text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] disabled:opacity-60"
              />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDueDate(todayISO)}
              disabled={disabled || isSubmitting}
              className={`min-h-[34px] rounded-lg border px-3 py-1 text-xs font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
                dueDate === todayISO
                  ? 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                  : 'border-[#7EB2C7] bg-[#FFFDF5] text-[#8A0303] hover:bg-[#B0D4E3]/40'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDueDate(tomorrowISO)}
              disabled={disabled || isSubmitting}
              className={`min-h-[34px] rounded-lg border px-3 py-1 text-xs font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
                dueDate === tomorrowISO
                  ? 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                  : 'border-[#7EB2C7] bg-[#FFFDF5] text-[#8A0303] hover:bg-[#B0D4E3]/40'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setDueDate('')}
              disabled={disabled || isSubmitting || !dueDate}
              className="min-h-[34px] rounded-lg border border-[#7EB2C7] bg-[#FFFDF5] px-3 py-1 text-xs font-semibold text-[#8A0303]/80 transition-colors duration-150 hover:bg-[#B0D4E3]/40 hover:text-[#8A0303] disabled:opacity-40 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              Clear
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-4 py-2.5 text-sm font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{isSubmitting ? 'Adding Task...' : 'Add Task'}</span>
        </button>
      </form>
    </aside>
  );
}
