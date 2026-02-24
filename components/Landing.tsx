'use client';

import React from 'react';

interface LandingProps {
  onEnter: () => void;
}

const Landing: React.FC<LandingProps> = ({ onEnter }) => {

  const scrollToManifesto = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('manifesto');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center">
          <div className="px-4 py-1 mb-8 border border-white/10 glass text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500">
            Engine v3.1 | Grounded Intensity
          </div>

          <h1 className="font-display text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
            <span className="block text-white">STOP WRITING</span>
            <span className="block text-red-600">WEAK SCRIPTS.</span>
          </h1>

          <p className="max-w-xl mx-auto text-neutral-400 text-sm md:text-base uppercase tracking-wide leading-relaxed mb-12">
            The era of soft motivation is dead. Forge high-retention masculinity content that strikes the nerve of reality. No metaphors. No fluff. Just the hard truth.
          </p>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
            <button
              onClick={onEnter}
              className="group relative flex-1 px-8 py-6 bg-white overflow-hidden transition-all duration-500 active:scale-95"
            >
              <span className="relative z-10 font-display text-xs font-black uppercase tracking-[0.3em] text-black flex items-center justify-center gap-2">
                Login with Google
              </span>

              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>

              <span className="absolute inset-0 z-20 flex items-center justify-center font-display text-xs font-black uppercase tracking-[0.3em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Verify Account
              </span>
            </button>

            <button
              onClick={scrollToManifesto}
              className="px-8 py-6 border border-neutral-800 text-neutral-500 font-display text-xs font-black uppercase tracking-[0.3em] hover:text-white hover:border-white transition-all flex items-center justify-center bg-transparent"
            >
              Read Manifesto
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-zinc-800 to-transparent"></div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-32 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid md:grid-cols-3 gap-12">
          <Feature number="01" title="Psychological War"
            text="We don't do inspiring. We confront behavior. Scripts target the exact moment of failure to force growth." />
          <Feature number="02" title="Rhythmic Assault"
            text="Short, stacked lines engineered for retention. Every second holds attention." />
          <Feature number="03" title="Zero Abstraction"
            text="No lions. No abyss. No filler. Only cold showers, heavy plates, and real discipline." />
        </div>

        <div className="mt-40 glass p-12 text-center border-zinc-900">
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase mb-8 tracking-tighter text-white">
            JOIN THE 1% OF CREATORS <br /> WHO MEAN IT.
          </h2>

          <button
            onClick={onEnter}
            className="px-12 py-5 bg-red-600 text-white font-display text-xs font-black uppercase tracking-[0.4em] hover:bg-red-700 transition-colors"
          >
            Login to Enter
          </button>
        </div>
      </section>
    </div>
  );
};

const Feature = ({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) => (
  <div className="space-y-4">
    <span className="text-red-600 font-display text-4xl font-black">{number}</span>
    <h3 className="font-display text-xl font-black uppercase tracking-tight text-white">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-wider">
      {text}
    </p>
  </div>
);

export default Landing;
