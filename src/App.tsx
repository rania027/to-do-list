import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Database, ListChecks, LogIn, LogOut, RefreshCw } from 'lucide-react';
import {
  buildSupabaseClient,
  clearStoredCredentials,
  getEnvCredentials,
  getStoredCredentials,
  saveStoredCredentials,
  type SupabaseCredentials,
} from './lib/supabase';
import {
  PRIORITY_WEIGHT,
  type CategoryFilter,
  type NewTodoInput,
  type SortOption,
  type StatusFilter,
  type Todo,
  type UpdateTodoInput,
} from './types/todo';
import { ErrorBanner } from './components/ErrorBanner';
import { ProgressSummary } from './components/ProgressSummary';
import { TaskForm } from './components/TaskForm';
import { TaskToolbar } from './components/TaskToolbar';
import { TaskCard } from './components/TaskCard';
import { UndoToast } from './components/UndoToast';
import { AuthModal } from './components/AuthModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

interface UndoState {
  todos: Todo[];
  message: string;
}

export default function App() {
  const envCredentials = useMemo(() => getEnvCredentials(), []);
  const [storedCredentials, setStoredCredentials] = useState<SupabaseCredentials | null>(() =>
    getStoredCredentials(),
  );

  const activeCredentials = envCredentials ?? storedCredentials;
  const supabase = useMemo(() => buildSupabaseClient(activeCredentials), [activeCredentials]);

  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(supabase));
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(!activeCredentials);

  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  const scheduleUndoToast = useCallback(
    (deletedTodos: Todo[], message: string) => {
      clearUndoTimer();
      setUndoState({ todos: deletedTodos, message });
      undoTimerRef.current = window.setTimeout(() => {
        setUndoState(null);
        undoTimerRef.current = null;
      }, 6500);
    },
    [clearUndoTimer],
  );

  useEffect(() => {
    return () => clearUndoTimer();
  }, [clearUndoTimer]);

  // Listen to Supabase Auth state changes when client is configured
  useEffect(() => {
    if (!supabase) {
      setUser(null);
      return;
    }

    let isMounted = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setUser(data.session?.user ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchTodos = useCallback(async () => {
    if (!supabase) {
      setTodos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    let query = supabase
      .from('todos')
      .select('id, title, description, priority, category, due_date, is_completed, user_id, created_at')
      .order('created_at', { ascending: false });

    if (user?.id) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTodos((data ?? []) as Todo[]);
  }, [supabase, user?.id]);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const handleAddTask = async (input: NewTodoInput): Promise<boolean> => {
    if (!supabase) {
      setShowConfigModal(true);
      setErrorMessage('Connect your Supabase project before creating tasks.');
      return false;
    }

    setIsAdding(true);
    setErrorMessage(null);

    const payload = {
      title: input.title,
      description: input.description,
      priority: input.priority,
      category: input.category,
      due_date: input.due_date,
      is_completed: false,
      user_id: user?.id ?? null,
    };

    const { data, error } = await supabase
      .from('todos')
      .insert(payload)
      .select('id, title, description, priority, category, due_date, is_completed, user_id, created_at')
      .single();

    setIsAdding(false);

    if (error) {
      setErrorMessage(error.message);
      return false;
    }

    if (data) {
      setTodos((prev) => [data as Todo, ...prev]);
    }
    return true;
  };

  const handleToggleComplete = async (todo: Todo) => {
    if (!supabase) {
      setShowConfigModal(true);
      return;
    }

    const nextCompleted = !todo.is_completed;
    setErrorMessage(null);

    setTodos((prev) =>
      prev.map((item) => (item.id === todo.id ? { ...item, is_completed: nextCompleted } : item)),
    );

    const { error } = await supabase
      .from('todos')
      .update({ is_completed: nextCompleted })
      .eq('id', todo.id);

    if (error) {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, is_completed: todo.is_completed } : item,
        ),
      );
      setErrorMessage(error.message);
    }
  };

  const handleUpdateTask = async (id: string, input: UpdateTodoInput): Promise<boolean> => {
    if (!supabase) {
      setShowConfigModal(true);
      return false;
    }

    setErrorMessage(null);

    const { data, error } = await supabase
      .from('todos')
      .update({
        title: input.title,
        description: input.description,
        priority: input.priority,
        category: input.category,
        due_date: input.due_date,
      })
      .eq('id', id)
      .select('id, title, description, priority, category, due_date, is_completed, user_id, created_at')
      .single();

    if (error) {
      setErrorMessage(error.message);
      return false;
    }

    if (data) {
      setTodos((prev) => prev.map((item) => (item.id === id ? (data as Todo) : item)));
    }
    return true;
  };

  const handleDeleteTask = async (todo: Todo) => {
    if (!supabase) {
      setShowConfigModal(true);
      return;
    }

    setErrorMessage(null);
    const previousTodos = todos;
    setTodos((prev) => prev.filter((item) => item.id !== todo.id));

    const { error } = await supabase.from('todos').delete().eq('id', todo.id);

    if (error) {
      setTodos(previousTodos);
      setErrorMessage(error.message);
      return;
    }

    scheduleUndoToast([todo], `Deleted "${todo.title}".`);
  };

  const handleClearCompleted = async () => {
    if (!supabase) {
      setShowConfigModal(true);
      return;
    }

    const completedTodos = todos.filter((t) => t.is_completed);
    if (completedTodos.length === 0) return;

    setIsClearing(true);
    setErrorMessage(null);

    const completedIds = completedTodos.map((t) => t.id);
    const previousTodos = todos;
    setTodos((prev) => prev.filter((t) => !t.is_completed));

    const { error } = await supabase.from('todos').delete().in('id', completedIds);

    setIsClearing(false);

    if (error) {
      setTodos(previousTodos);
      setErrorMessage(error.message);
      return;
    }

    const count = completedTodos.length;
    scheduleUndoToast(
      completedTodos,
      `Cleared ${count} completed ${count === 1 ? 'task' : 'tasks'}.`,
    );
  };

  const handleUndoDelete = async () => {
    if (!supabase || !undoState || undoState.todos.length === 0) return;

    setIsRestoring(true);
    setErrorMessage(null);

    const rowsToRestore = undoState.todos.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      priority: item.priority,
      category: item.category,
      due_date: item.due_date,
      is_completed: item.is_completed,
      user_id: item.user_id,
      created_at: item.created_at,
    }));

    const { data, error } = await supabase
      .from('todos')
      .insert(rowsToRestore)
      .select('id, title, description, priority, category, due_date, is_completed, user_id, created_at');

    setIsRestoring(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    clearUndoTimer();
    setUndoState(null);

    if (data && data.length > 0) {
      setTodos((prev) => {
        const merged = [...(data as Todo[]), ...prev];
        return merged.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      });
    } else {
      void fetchTodos();
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setErrorMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSaveCredentials = (creds: SupabaseCredentials) => {
    saveStoredCredentials(creds);
    setStoredCredentials(creds);
    setErrorMessage(null);
  };

  const handleClearCredentials = () => {
    clearStoredCredentials();
    setStoredCredentials(null);
    setTodos([]);
    setUser(null);
  };

  const totalCount = todos.length;
  const completedCount = useMemo(() => todos.filter((t) => t.is_completed).length, [todos]);

  const visibleTodos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = todos.filter((todo) => {
      if (statusFilter === 'Active' && todo.is_completed) return false;
      if (statusFilter === 'Completed' && !todo.is_completed) return false;
      if (categoryFilter !== 'All' && todo.category !== categoryFilter) return false;

      if (query) {
        const titleMatch = todo.title.toLowerCase().includes(query);
        const descMatch = (todo.description ?? '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'due_date') {
        if (!a.due_date && !b.due_date) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        if (a.due_date !== b.due_date) {
          return a.due_date.localeCompare(b.due_date);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (sortBy === 'priority') {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [todos, searchQuery, statusFilter, categoryFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== 'All' || categoryFilter !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#8A0303]">
      <header className="border-b border-[#7EB2C7] bg-[#FFFDF5]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[#8A0303] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
          >
            Folio
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#8A0303]/80">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="hover:text-[#8A0303] hover:underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              All Tasks
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Active')}
              className="hover:text-[#8A0303] hover:underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Completed')}
              className="hover:text-[#8A0303] hover:underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="hover:text-[#8A0303] hover:underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              Database Schema
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            {!supabase && (
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#7EB2C7] bg-[#FFF7DF] px-3.5 py-2 text-xs font-semibold text-[#8A0303] transition-colors duration-150 hover:bg-[#B0D4E3]/40 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              >
                <Database className="h-4 w-4" aria-hidden="true" />
                <span>Connect Supabase</span>
              </button>
            )}

            {supabase && user ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden sm:inline-block max-w-[180px] truncate text-xs font-medium text-[#8A0303]/80">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#7EB2C7] bg-[#FFF7DF] px-4 py-2 text-xs font-semibold text-[#8A0303] transition-colors duration-150 hover:bg-[#B0D4E3]/40 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              supabase && (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-4 py-2 text-xs font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[#8A0303] sm:text-4xl [text-wrap:balance]">
              Focused Tasks, Quiet Clarity
            </h1>
            <p className="mt-2 text-base text-[#8A0303]/75">
              {user
                ? `Signed in as ${user.email ?? 'member'}. Your tasks sync directly to your account.`
                : 'Organize priorities, track deadlines, and keep your day moving—with optional account sign-in.'}
            </p>
          </div>

          {supabase && (
            <button
              type="button"
              onClick={() => void fetchTodos()}
              disabled={isLoading}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#7EB2C7] bg-[#FFF7DF] px-4 py-2 text-xs font-semibold text-[#8A0303] transition-colors duration-150 hover:bg-[#B0D4E3]/40 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {!supabase && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-5">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#8A0303]">
                Supabase Configuration Needed
              </h2>
              <p className="mt-1 text-sm text-[#8A0303]/75">
                Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect your public.todos table.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-4 py-2 text-sm font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              <Database className="h-4 w-4" aria-hidden="true" />
              <span>Configure Connection</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onOpenConfig={() => setShowConfigModal(true)}
          />
        )}

        <ProgressSummary
          totalCount={totalCount}
          completedCount={completedCount}
          isClearing={isClearing}
          onClearCompleted={() => void handleClearCompleted()}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <TaskForm onAddTask={handleAddTask} isSubmitting={isAdding} disabled={!supabase} />
          </div>

          <section aria-label="Task list" className="lg:col-span-8">
            <TaskToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {isLoading ? (
              <div className="space-y-3" aria-label="Loading tasks">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-5"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="h-6 w-6 rounded-lg bg-[#B0D4E3]/70" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-2/5 rounded bg-[#B0D4E3]/70" />
                        <div className="h-3 w-4/5 rounded bg-[#B0D4E3]/50" />
                        <div className="h-3 w-1/3 rounded bg-[#B0D4E3]/50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleTodos.length === 0 ? (
              <div className="rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]">
                  <ListChecks className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-[#8A0303]">
                  {hasActiveFilters
                    ? 'No matching tasks found'
                    : supabase
                      ? 'Your ledger is clear'
                      : 'Connect Supabase to load tasks'}
                </h3>
                <p className="mx-auto mt-1.5 max-w-md text-sm text-[#8A0303]/75">
                  {hasActiveFilters
                    ? 'Try adjusting your search query, status filter, or category filter.'
                    : supabase
                      ? 'Use the New Task panel to add your first item, set its priority, and assign a due date.'
                      : 'Provide your Supabase Project URL and Anon Key to begin creating and syncing tasks.'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 inline-flex min-h-[40px] items-center rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-4 py-2 text-xs font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTodos.map((todo) => (
                  <TaskCard
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {undoState && (
        <UndoToast
          message={undoState.message}
          isRestoring={isRestoring}
          onUndo={() => void handleUndoDelete()}
          onDismiss={() => {
            clearUndoTimer();
            setUndoState(null);
          }}
        />
      )}

      {showAuthModal && supabase && (
        <AuthModal
          supabase={supabase}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => void fetchTodos()}
        />
      )}

      {showConfigModal && (
        <SupabaseConfigModal
          initialCredentials={storedCredentials}
          hasEnvCredentials={Boolean(envCredentials)}
          onSaveCredentials={handleSaveCredentials}
          onClearCredentials={handleClearCredentials}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}
