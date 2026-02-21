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

  // Fetch user data
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

      // Update credits only if not elite
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
    <div className="min-h-screen bg-black text-neutral-200 pb-20 selection:bg-red-600 selection:text-white overflow-x-hidden">

      {view === 'landing' ? (
        <Landing onEnter={enterForge} />
      ) : (
        <>
          {/* NAVBAR */}
          <nav className="relative z-20 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">

            <button
              onClick={() => setView('landing')}
              className="font-display text-sm font-black tracking-tighter text-white"
            >
              FORGE<span className="text-red-600">SCRIPT</span>
            </button>

            <div className="flex items-center gap-8">

              {/* Credits Display */}
              <div className="px-4 py-1.5 border border-zinc-800 bg-black/40 rounded-full flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    plan === 'elite' || credits > 0
                      ? 'bg-red-600 animate-pulse'
                      : 'bg-zinc-700'
                  }`}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                  {plan === 'elite'
                    ? 'Unlimited'
                    : `${credits} Forges`}
                </span>
              </div>

              {/* Upgrade Button */}
              {user && plan !== 'elite' && (
                <button
                  onClick={() => (window.location.href = '/upgrade')}
                  className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                >
                  Upgrade
                </button>
              )}

              {/* User Info */}
              {user && (
                <>
                  <div className="hidden md:flex flex-col items-end leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                      {user.name}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      Logout
                    </button>
                  </div>

                  {user.image && (
                    <img
                      src={user.image}
                      alt="profile"
                      className="w-9 h-9 border border-zinc-800 p-0.5 rounded-full"
                    />
                  )}
                </>
              )}

            </div>
          </nav>

          {/* HEADER */}
          <header className="relative z-10 pt-8 pb-12 px-6 text-center">
            <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-gradient">
              The Forge
            </h1>
            <p className="max-w-md mx-auto text-neutral-500 text-sm uppercase tracking-wide leading-relaxed">
              Define the struggle. Choose the tone. Build the legend.
            </p>
          </header>

          {/* MAIN */}
          <main className="relative z-10 max-w-4xl mx-auto px-6">

            <div className="mb-16">
              <ScriptForm
                onGenerate={handleGenerate}
                isLoading={isLoading}
                disabled={
                  !isAuthenticated ||
                  (plan !== 'elite' && credits <= 0)
                }
              />
            </div>

            {error && (
              <div className="mb-12 glass p-4 border border-red-900/50 text-red-500 text-center font-bold uppercase text-xs tracking-widest">
                {error}
              </div>
            )}

            {isLoading && !script && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-16 h-16 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-display uppercase text-xs tracking-[0.4em] text-white animate-pulse">
                  Forging Your Script...
                </p>
              </div>
            )}

            {script && !isLoading && (
              <div className="mt-12">
                <ScriptDisplay script={script} />
                <button
                  onClick={() => {
                    setScript(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-12 text-[10px] uppercase font-bold tracking-widest text-neutral-600 hover:text-red-500 w-full"
                >
                  ← New Session
                </button>
              </div>
            )}

          </main>
        </>
      )}
    </div>
  );
}