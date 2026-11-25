import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

const STORAGE_URL_KEY = 'folio_supabase_url';
const STORAGE_KEY_KEY = 'folio_supabase_anon_key';

export function getEnvCredentials(): SupabaseCredentials | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (url && anonKey) {
    return { url, anonKey };
  }
  return null;
}

export function getStoredCredentials(): SupabaseCredentials | null {
  try {
    const url = window.sessionStorage.getItem(STORAGE_URL_KEY)?.trim();
    const anonKey = window.sessionStorage.getItem(STORAGE_KEY_KEY)?.trim();
    if (url && anonKey) {
      return { url, anonKey };
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }
  return null;
}

export function saveStoredCredentials(creds: SupabaseCredentials): void {
  try {
    window.sessionStorage.setItem(STORAGE_URL_KEY, creds.url.trim());
    window.sessionStorage.setItem(STORAGE_KEY_KEY, creds.anonKey.trim());
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

export function clearStoredCredentials(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_URL_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY_KEY);
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

export function isValidSupabaseUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function buildSupabaseClient(creds: SupabaseCredentials | null): SupabaseClient | null {
  if (!creds) {
    return null;
  }
  if (!isValidSupabaseUrl(creds.url) || !creds.anonKey.trim()) {
    return null;
  }
  return createClient(creds.url.trim(), creds.anonKey.trim());
}

export const SUPABASE_SCHEMA_SQL = `create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text not null default 'Medium',
  category text not null default 'Personal',
  due_date date,
  is_completed boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on public.todos (user_id);
create index if not exists todos_due_date_idx on public.todos (due_date);

alter table public.todos enable row level security;

create policy "Allow guest and owner select" on public.todos
  for select using (user_id is null or auth.uid() = user_id);

create policy "Allow guest and owner insert" on public.todos
  for insert with check (user_id is null or auth.uid() = user_id);

create policy "Allow guest and owner update" on public.todos
  for update using (user_id is null or auth.uid() = user_id);

create policy "Allow guest and owner delete" on public.todos
  for delete using (user_id is null or auth.uid() = user_id);`;
