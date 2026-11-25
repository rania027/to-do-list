import { useState, type FormEvent } from 'react';
import { Calendar, Check, Pencil, Trash2, X } from 'lucide-react';
import {
  CATEGORIES,
  PRIORITIES,
  type Category,
  type Priority,
  type Todo,
  type UpdateTodoInput,
} from '../types/todo';
import {
  formatCreatedAt,
  formatDueDate,
  getTodayISO,
  getTomorrowISO,
  isTaskOverdue,
} from '../lib/dateUtils';

interface TaskCardProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => Promise<void>;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<boolean>;
  onDelete: (todo: Todo) => Promise<void>;
}

export function TaskCard({ todo, onToggleComplete, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description ?? '');
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editCategory, setEditCategory] = useState<Category>(todo.category);
  const [editDueDate, setEditDueDate] = useState(todo.due_date ?? '');
  const [editError, setEditError] = useState<string | null>(null);

  const overdue = isTaskOverdue(todo.due_date, todo.is_completed);
  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();

  const startEditing = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setEditDueDate(todo.due_date ?? '');
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditError('Title cannot be empty.');
      return;
    }

    setIsSaving(true);
    const ok = await onUpdate(todo.id, {
      title: trimmed,
      description: editDescription.trim() ? editDescription.trim() : null,
      priority: editPriority,
      category: editCategory,
      due_date: editDueDate ? editDueDate : null,
    });
    setIsSaving(false);

    if (ok) {
      setIsEditing(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggleComplete(todo);
    setIsToggling(false);
  };

  if (isEditing) {
    return (
      <article className="rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[#8A0303]">
              Edit Task
            </h3>
            <button
              type="button"
              onClick={cancelEditing}
              aria-label="Cancel editing"
              className="rounded-lg p-1.5 text-[#8A0303]/70 transition-colors duration-150 hover:bg-[#B0D4E3]/40 hover:text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label htmlFor={`edit-title-${todo.id}`} className="block text-xs font-semibold text-[#8A0303]">
              Title
            </label>
            <input
              id={`edit-title-${todo.id}`}
              type="text"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                if (editError) setEditError(null);
              }}
              disabled={isSaving}
              className="mt-1 min-h-[40px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3 py-2 text-sm text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            />
            {editError && <p className="mt-1 text-xs font-medium text-[#8A0303]">{editError}</p>}
          </div>

          <div>
            <label
              htmlFor={`edit-desc-${todo.id}`}
              className="block text-xs font-semibold text-[#8A0303]"
            >
              Description
            </label>
            <textarea
              id={`edit-desc-${todo.id}`}
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={isSaving}
              placeholder="Optional description..."
              className="mt-1 w-full resize-none rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3 py-2 text-sm text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-semibold text-[#8A0303]">Priority</span>
              <div className="mt-1 grid grid-cols-3 gap-1.5">
                {PRIORITIES.map((p) => {
                  const selected = editPriority === p;
                  const isHigh = p === 'High';
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditPriority(p)}
                      disabled={isSaving}
                      className={`min-h-[38px] rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
                        selected
                          ? isHigh
                            ? 'border-[#8A0303] bg-[#8A0303] text-[#FFFDF5]'
                            : 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                          : 'border-[#7EB2C7] bg-[#FFFDF5] text-[#8A0303] hover:bg-[#B0D4E3]/40'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor={`edit-cat-${todo.id}`}
                className="block text-xs font-semibold text-[#8A0303]"
              >
                Category
              </label>
              <select
                id={`edit-cat-${todo.id}`}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category)}
                disabled={isSaving}
                className="mt-1 min-h-[38px] w-full rounded-lg border border-[#7EB2C7] bg-[#FFFDF5] px-3 py-1.5 text-xs font-semibold text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#FFF7DF] text-[#8A0303]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`edit-due-${todo.id}`} className="block text-xs font-semibold text-[#8A0303]">
              Due Date
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <input
                id={`edit-due-${todo.id}`}
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                disabled={isSaving}
                className="min-h-[38px] flex-1 rounded-lg border border-[#7EB2C7] bg-[#FFFDF5] px-3 py-1.5 font-mono text-xs tabular-nums text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              />
              <button
                type="button"
                onClick={() => setEditDueDate(todayISO)}
                disabled={isSaving}
                className="min-h-[38px] rounded-lg border border-[#7EB2C7] bg-[#FFFDF5] px-2.5 py-1 text-xs font-semibold text-[#8A0303] hover:bg-[#B0D4E3]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setEditDueDate(tomorrowISO)}
                disabled={isSaving}
                className="min-h-[38px] rounded-lg border border-[#7EB2C7] bg-[#FFFDF5] px-2.5 py-1 text-xs font-semibold text-[#8A0303] hover:bg-[#B0D4E3]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setEditDueDate('')}
                disabled={isSaving || !editDueDate}
                className="min-h-[38px] rounded-lg border border-[#7EB2C7] bg-[#FFFDF5] px-2.5 py-1 text-xs font-semibold text-[#8A0303]/80 hover:bg-[#B0D4E3]/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#7EB2C7]/50 pt-3">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSaving}
              className="min-h-[40px] rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-4 py-2 text-xs font-semibold text-[#8A0303] transition-colors duration-150 hover:bg-[#B0D4E3]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[40px] rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-4 py-2 text-xs font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      className={`rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-4 sm:p-5 transition-colors duration-150 ${
        todo.is_completed ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.is_completed}
          aria-label={
            todo.is_completed ? `Mark "${todo.title}" as active` : `Mark "${todo.title}" as completed`
          }
          onClick={handleToggle}
          disabled={isToggling}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
            todo.is_completed
              ? 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
              : 'border-[#7EB2C7] bg-[#FFFDF5] text-transparent hover:bg-[#B0D4E3]/40'
          }`}
        >
          <Check className="h-4 w-4 stroke-[2.75]" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className={`text-base font-semibold leading-snug text-[#8A0303] break-words ${
                todo.is_completed ? 'line-through decoration-[#8A0303] decoration-2 opacity-60' : ''
              }`}
            >
              {todo.title}
            </h3>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={startEditing}
                aria-label={`Edit "${todo.title}"`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#7EB2C7]/70 bg-[#FFFDF5] text-[#8A0303] transition-colors duration-150 hover:border-[#7EB2C7] hover:bg-[#B0D4E3]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void onDelete(todo)}
                aria-label={`Delete "${todo.title}"`}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8A0303] text-[#FFFDF5] transition-colors duration-150 hover:bg-[#660000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {todo.description && (
            <p
              className={`mt-1.5 text-sm leading-relaxed text-[#8A0303]/80 whitespace-pre-line break-words ${
                todo.is_completed ? 'line-through decoration-[#8A0303]/70 opacity-60' : ''
              }`}
            >
              {todo.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs">
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 font-semibold whitespace-nowrap ${
                todo.priority === 'High'
                  ? 'bg-[#8A0303] text-[#FFFDF5]'
                  : 'bg-[#B0D4E3] text-[#8A0303]'
              }`}
            >
              {todo.priority} Priority
            </span>

            {overdue && (
              <span className="inline-flex items-center rounded-md bg-[#8A0303] px-2.5 py-1 font-semibold text-[#FFFDF5] whitespace-nowrap">
                Overdue
              </span>
            )}

            <span className="font-medium text-[#8A0303]/75">{todo.category}</span>

            {todo.due_date && (
              <>
                <span aria-hidden="true" className="text-[#8A0303]/45">
                  ·
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                    overdue ? 'font-semibold text-[#8A0303]' : 'text-[#8A0303]/75'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  Due {formatDueDate(todo.due_date)}
                </span>
              </>
            )}

            <span aria-hidden="true" className="text-[#8A0303]/45">
              ·
            </span>
            <span className="font-mono tabular-nums text-[#8A0303]/60">
              Added {formatCreatedAt(todo.created_at)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
