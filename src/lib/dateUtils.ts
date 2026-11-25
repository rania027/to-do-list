function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  return toLocalISODate(new Date());
}

export function getTomorrowISO(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalISODate(tomorrow);
}

export function isTaskOverdue(dueDate: string | null, isCompleted: boolean): boolean {
  if (!dueDate || isCompleted) {
    return false;
  }
  return dueDate < getTodayISO();
}

export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) {
    return '';
  }
  const today = getTodayISO();
  const tomorrow = getTomorrowISO();
  if (dueDate === today) {
    return 'Today';
  }
  if (dueDate === tomorrow) {
    return 'Tomorrow';
  }
  const [year, month, day] = dueDate.split('-').map(Number);
  if (!year || !month || !day) {
    return dueDate;
  }
  const parsed = new Date(year, month - 1, day);
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: parsed.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatCreatedAt(createdAt: string): string {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
