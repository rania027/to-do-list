export type Priority = 'Low' | 'Medium' | 'High';

export type Category = 'Personal' | 'Study' | 'Work' | 'Errands';

export type StatusFilter = 'All' | 'Active' | 'Completed';

export type CategoryFilter = 'All' | Category;

export type SortOption = 'newest' | 'due_date' | 'priority';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: Category;
  due_date: string | null;
  is_completed: boolean;
  user_id: string | null;
  created_at: string;
}

export interface NewTodoInput {
  title: string;
  description: string | null;
  priority: Priority;
  category: Category;
  due_date: string | null;
}

export interface UpdateTodoInput {
  title: string;
  description: string | null;
  priority: Priority;
  category: Category;
  due_date: string | null;
}

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const CATEGORIES: Category[] = ['Personal', 'Study', 'Work', 'Errands'];

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};
