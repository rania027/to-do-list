import { useState, type FormEvent } from 'react';
import { Check, Copy, Database, X } from 'lucide-react';
import {
  isValidSupabaseUrl,
  SUPABASE_SCHEMA_SQL,
  type SupabaseCredentials,
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  initialCredentials: SupabaseCredentials | null;
  hasEnvCredentials: boolean;
  onSaveCredentials: (creds: SupabaseCredentials) => void;
  onClearCredentials: () => void;
  onClose: () => void;
}

export function SupabaseConfigModal({
  initialCredentials,
  hasEnvCredentials,
  onSaveCredentials,
  onClearCredentials,
  onClose,
}: SupabaseConfigModalProps) {
  const [url, setUrl] = useState(initialCredentials?.url ?? '');
  const [anonKey, setAnonKey] = useState(initialCredentials?.anonKey ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();

    if (!isValidSupabaseUrl(trimmedUrl)) {
      setValidationError('Enter a valid Supabase Project URL starting with https://');
      return;
    }
    if (!trimmedKey) {
      setValidationError('Enter your Supabase anon public key.');
      return;
    }

    setValidationError(null);
    onSaveCredentials({ url: trimmedUrl, anonKey: trimmedKey });
    onClose();
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      window.setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      setCopiedSql(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="supabase-config-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#8A0303]/30 p-4 backdrop-blur-[2px]"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]">
              <Database className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="supabase-config-title"
                className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#8A0303]"
              >
                Connect Supabase Database
              </h2>
              <p className="mt-1 text-sm text-[#8A0303]/75">
                {hasEnvCredentials
                  ? 'Environment variables are active. You can also view the required SQL schema below.'
                  : 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set in your environment. Enter them below to connect immediately.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup modal"
            className="rounded-lg p-1.5 text-[#8A0303]/70 transition-colors duration-150 hover:bg-[#B0D4E3]/40 hover:text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!hasEnvCredentials && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {validationError && (
              <div
                role="alert"
                className="rounded-xl bg-[#8A0303] px-3.5 py-2.5 text-xs font-medium text-[#FFFDF5]"
              >
                {validationError}
              </div>
            )}

            <div>
              <label htmlFor="sb-url" className="block text-sm font-semibold text-[#8A0303]">
                VITE_SUPABASE_URL
              </label>
              <input
                id="sb-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-ref.supabase.co"
                className="mt-1.5 min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3.5 py-2 font-mono text-xs text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              />
            </div>

            <div>
              <label htmlFor="sb-key" className="block text-sm font-semibold text-[#8A0303]">
                VITE_SUPABASE_ANON_KEY
              </label>
              <input
                id="sb-key"
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="mt-1.5 min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3.5 py-2 font-mono text-xs text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {initialCredentials ? (
                <button
                  type="button"
                  onClick={() => {
                    onClearCredentials();
                    setUrl('');
                    setAnonKey('');
                  }}
                  className="min-h-[40px] rounded-xl bg-[#8A0303] px-4 py-2 text-xs font-semibold text-[#FFFDF5] transition-colors duration-150 hover:bg-[#660000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
                >
                  Disconnect Saved Keys
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[40px] rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-4 py-2 text-xs font-semibold text-[#8A0303] transition-colors duration-150 hover:bg-[#B0D4E3]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-5 py-2 text-xs font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
                >
                  Connect Supabase
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-6 border-t border-[#7EB2C7]/60 pt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#8A0303]">
              Required SQL Schema (public.todos)
            </h3>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#7EB2C7] bg-[#FFFDF5] px-3 py-1 text-xs font-semibold text-[#8A0303] transition-colors duration-150 hover:bg-[#B0D4E3]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              {copiedSql ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="mt-2.5 overflow-x-auto rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] p-3.5 font-mono text-xs leading-relaxed text-[#8A0303]">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
}
