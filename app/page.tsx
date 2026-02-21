'use client';

import React, { useState, useEffect } from 'react';
import ScriptForm from '../components/ScriptForm';
import ScriptDisplay from '../components/ScriptDisplay';
import Landing from '../components/Landing';
import { forgeScriptAction } from './actions';
import { ScriptRequest, ScriptOutput } from '../types';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const user = session?.user as any;

  const [view, setView] = useState<'landing' | 'forge'>('landing');
  const [script, setScript] = useState<ScriptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [credits, setCredits] = useState<number>(0);
  const [plan, setPlan] = useState<string>('free');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      setCredits(data.credits ?? 0);
      setPlan(data.plan ?? 'free');
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, view]);

  useEffect(() => {
    if (!isAuthenticated && view === 'forge') {
      setView('landing');
    }
  }, [isAuthenticated, view]);

  const handleGenerate = async (params: ScriptRequest) => {
    if (!isAuthenticated) {
      setError('Please login first.');
      return;
    }

    if (plan !== 'elite' && credits <= 0) {
      setError('No credits remaining.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await forgeScriptAction(params);

      if (!result?.variations?.length) {
        setError('Failed to generate script.');
        return;
      }

      setScript(result);

      if (plan !== 'elite' && typeof result.remainingCredits === 'number') {
        setCredits(result.remainingCredits);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Cancel subscription at end of billing cycle?")) return;

    setIsCancelling(true);

    try {
      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });

      if (!res.ok) {
        alert("Cancellation failed.");
        return;
      }

      alert("Subscription will cancel at the end of your billing cycle.");

      await fetchUserData();

    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setIsCancelling(false);
    }
  };

  const enterForge = () => {
    if (isAuthenticated) {
      setView('forge');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      signIn('google');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-200 pb-20 overflow-x-hidden">

      {view === 'landing' ? (
        <Landing onEnter={enterForge} />
      ) : (
        <>
          <nav className="px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">

            <button
              onClick={() => setView('landing')}
              className="font-display text-sm font-black tracking-tighter text-white"
            >
              FORGE<span className="text-red-600">SCRIPT</span>
            </button>

            <div className="flex items-center gap-6">

              <div className="px-4 py-1.5 border border-zinc-800 bg-black/40 rounded-full flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                  {plan === 'elite'
                    ? 'Unlimited'
                    : `${credits} Forges`}
                </span>
              </div>

              {user && plan === 'free' && (
                <button
                  onClick={() => (window.location.href = '/upgrade')}
                  className="text-xs uppercase tracking-widest text-zinc-400 hover:text-red-500 transition"
                >
                  Upgrade
                </button>
              )}

              {user && plan !== 'free' && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="text-xs uppercase tracking-widest text-red-500 hover:text-red-400 transition"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                </button>
              )}

              {user && (
                <button
                  onClick={() => signOut()}
                  className="text-xs uppercase tracking-widest text-zinc-600 hover:text-red-500 transition"
                >
                  Logout
                </button>
              )}

            </div>
          </nav>

          <main className="max-w-4xl mx-auto px-6">

            <ScriptForm
              onGenerate={handleGenerate}
              isLoading={isLoading}
              disabled={!isAuthenticated || (plan !== 'elite' && credits <= 0)}
            />

            {error && (
              <div className="mt-6 p-4 border border-red-900/50 text-red-500 text-center text-xs uppercase tracking-widest">
                {error}
              </div>
            )}

            {script && !isLoading && (
              <div className="mt-12">
                <ScriptDisplay script={script} />
              </div>
            )}

          </main>
        </>
      )}
    </div>
  );
}