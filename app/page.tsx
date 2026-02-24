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
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [totalCredits, setTotalCredits] = useState<number>(0);

  const isSubscriptionPlan = plan === 'elite' || plan === 'pro';

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      setCredits(data.credits ?? 0);
      setTotalCredits(data.totalCredits ?? 0);
      setPlan(data.plan ?? 'free');
      setSubscriptionStatus(data.subscriptionStatus ?? null);
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
      setError(err instanceof Error ? err.message : 'Something went wrong.');
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

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);

      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setSubscriptionStatus('cancelled');
      setShowCancelModal(false);

    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setIsCancelling(false);
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
          <nav className="relative z-20 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">

            <button
              onClick={() => setView('landing')}
              className="font-display text-sm font-black tracking-tighter text-white"
            >
              FORGE<span className="text-red-600">SCRIPT</span>
            </button>

            <div className="flex items-center gap-8">

              <div className="px-4 py-1.5 border border-zinc-800 bg-black/40 rounded-full flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    plan === 'elite' || credits > 0
                      ? 'bg-red-600 animate-pulse'
                      : 'bg-zinc-700'
                  }`}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                  {`${totalCredits} Forges`}
                </span>
              </div>

              {/* Cancel for Pro + Elite */}
              {user && isSubscriptionPlan && subscriptionStatus !== 'cancelled' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={isCancelling}
                  className="text-[10px] uppercase font-bold tracking-widest text-red-500 hover:text-red-400 transition-colors disabled:text-zinc-600"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}

              {/* Cancelled State */}
              {user && isSubscriptionPlan && subscriptionStatus === 'cancelled' && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  Cancelled (Active Until Period Ends)
                </span>
              )}

              {/* Upgrade only if free */}
              {user && plan === 'free' && (
                <button
                  onClick={() => (window.location.href = '/upgrade')}
                  className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                >
                  Upgrade
                </button>
              )}

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

          <header className="relative z-10 pt-8 pb-12 px-6 text-center">
            <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-gradient">
              The Forge
            </h1>
            <p className="max-w-md mx-auto text-neutral-500 text-sm uppercase tracking-wide leading-relaxed">
              Define the struggle. Choose the tone. Build the legend.
            </p>
          </header>

          <main className="relative z-10 max-w-4xl mx-auto px-6">

  {/* OUT OF CREDITS BLOCK - ADDED */}
  {isAuthenticated && plan !== 'elite' && credits <= 0 && (
    <div className="mb-12 border border-red-900/50 bg-black/40 backdrop-blur-sm rounded-2xl p-8 text-center">
      <h2 className="text-xl font-black uppercase tracking-widest text-red-500 mb-4">
        You’ve Run Out of Forges
      </h2>

      <p className="text-zinc-400 text-sm mb-8">
        Your legend pauses here. Continue forging by purchasing more credits.
      </p>

      <button
        onClick={() => (window.location.href = '/upgrade?tab=credits')}
        className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition"
      >
        Buy Credits
      </button>
    </div>
  )}

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

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-[90%] max-w-md">

            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4">
              Cancel {plan.toUpperCase()} Subscription
            </h2>

            <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
              Are you sure you want to cancel your {plan} access?
              <br />
              You will retain access until the end of your billing cycle.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-zinc-700 rounded-xl text-xs uppercase font-bold tracking-widest text-zinc-400 hover:border-zinc-500 transition"
              >
                Keep Subscription
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl text-xs uppercase font-black tracking-widest bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}