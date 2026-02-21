'use client';

import { useRouter } from "next/navigation";

export default function UpgradePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/")}
        className="mb-12 text-xs uppercase tracking-[0.3em] text-zinc-500 hover:text-red-500 transition"
      >
        ← Go Back
      </button>

      {/* TITLE */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          FORGE YOUR LEVEL
        </h1>
      </div>

      {/* PRICING CARDS */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

  {/* BASIC */}
  <div className="border border-zinc-800 rounded-3xl p-12 bg-black 
                  hover:border-zinc-600 transition duration-300
                  flex flex-col">

    <h2 className="text-2xl font-bold mb-6 text-zinc-400">
      BASIC
    </h2>

    <div className="text-5xl font-black mb-8">
      $19<span className="text-lg font-medium text-zinc-500"> / month</span>
    </div>

    {/* FLEX GROW SECTION */}
    <ul className="space-y-4 text-zinc-400 mb-12 flex-grow">
      <li>• 50 Scripts / Month</li>
      <li>• Fast Generation</li>
      <li>• Premium Tone Engine</li>
      <li>• Standard Support</li>
    </ul>

    {/* BUTTON LOCKED TO BOTTOM */}
    <button className="w-full border border-zinc-700 py-4 rounded-xl 
                       text-sm font-bold uppercase tracking-widest 
                       hover:border-red-600 hover:text-red-500 
                       transition mt-auto">
      Choose Basic
    </button>
  </div>

  {/* ELITE */}
  <div className="relative border border-zinc-800 rounded-3xl p-12 bg-black
                  transition duration-300
                  hover:border-red-600 hover:bg-[#0a0000]
                  flex flex-col group">

    <div className="absolute top-6 right-6 text-xs bg-zinc-800 
                    px-3 py-1 rounded-full uppercase tracking-widest 
                    group-hover:bg-red-600 transition">
      Most Popular
    </div>

    <h2 className="text-2xl font-bold mb-6 text-white">
      ELITE
    </h2>

    <div className="text-5xl font-black mb-8">
      $39<span className="text-lg font-medium text-zinc-500"> / month</span>
    </div>

    {/* FLEX GROW SECTION */}
    <ul className="space-y-4 text-zinc-400 mb-12 flex-grow">
      <li>• Unlimited Scripts</li>
      <li>• Priority Speed</li>
      <li>• Advanced Psychological Mode</li>
      <li>• Future AI Upgrades</li>
      <li>• Early Access Features</li>
    </ul>

    {/* BUTTON LOCKED TO BOTTOM */}
    <button className="w-full py-4 rounded-xl text-sm font-black 
                       uppercase tracking-widest border border-red-600 
                       text-red-500 hover:bg-red-600 hover:text-white 
                       transition mt-auto">
      Upgrade to Elite
    </button>
  </div>

    </div>
    </div>
  );
}