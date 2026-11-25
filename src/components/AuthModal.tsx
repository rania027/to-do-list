import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthModalProps {
  supabase: SupabaseClient;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AuthModal({ supabase, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      setIsSubmitting(false);
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      onAuthSuccess();
      onClose();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });
    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    if (data.session) {
      onAuthSuccess();
      onClose();
    } else {
      setInfoMessage('Account created. Check your inbox to confirm your email, then sign in.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#8A0303]/30 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#7EB2C7] bg-[#FFF7DF] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="auth-modal-title"
              className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#8A0303]"
            >
              {mode === 'signin' ? 'Sign In to Your Ledger' : 'Create an Account'}
            </h2>
            <p className="mt-1 text-sm text-[#8A0303]/75">
              Sync tasks with your user account, or continue anytime as a guest.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-[#8A0303]/70 transition-colors duration-150 hover:bg-[#B0D4E3]/40 hover:text-[#8A0303] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            className={`min-h-[40px] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
              mode === 'signin'
                ? 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                : 'border-[#7EB2C7] bg-[#FFFDF5] text-[#8A0303]/80 hover:bg-[#B0D4E3]/35'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setInfoMessage(null);
            }}
            className={`min-h-[40px] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7] ${
              mode === 'signup'
                ? 'border-[#7EB2C7] bg-[#B0D4E3] text-[#8A0303]'
                : 'border-[#7EB2C7] bg-[#FFFDF5] text-[#8A0303]/80 hover:bg-[#B0D4E3]/35'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-xl bg-[#8A0303] px-3.5 py-2.5 text-xs font-medium text-[#FFFDF5]"
          >
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="mt-4 rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-3.5 py-2.5 text-xs font-medium text-[#8A0303]">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-semibold text-[#8A0303]">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3.5 py-2 text-sm text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-semibold text-[#8A0303]">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={isSubmitting}
              className="mt-1.5 min-h-[42px] w-full rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-3.5 py-2 text-sm text-[#8A0303] placeholder:text-[#8A0303]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[42px] rounded-xl border border-[#7EB2C7] bg-[#FFFDF5] px-4 py-2 text-sm font-semibold text-[#8A0303] transition-colors duration-150 hover:bg-[#B0D4E3]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              Continue as Guest
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] rounded-xl border border-[#7EB2C7] bg-[#B0D4E3] px-5 py-2 text-sm font-bold text-[#8A0303] transition-colors duration-150 hover:bg-[#7EB2C7] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB2C7]"
            >
              {isSubmitting
                ? mode === 'signin'
                  ? 'Signing In...'
                  : 'Creating Account...'
                : mode === 'signin'
                  ? 'Sign In'
                  : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
