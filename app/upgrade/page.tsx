'use client';

import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpgradePage() {
  const router = useRouter();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: "pro" | "elite") => {
    await loadRazorpay();

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!data.subscriptionId) {
      alert("Subscription creation failed");
      return;
    }

    const options = {
      key: data.key,
      subscription_id: data.subscriptionId,
      name: "ForgeScript",
      description: plan === "pro" ? "Pro Plan" : "Elite Plan",
      handler: function () {
        alert("Subscription successful!");
        router.push("/");
      },
      theme: {
        color: "#dc2626",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">

      <button
        onClick={() => router.push("/")}
        className="mb-12 text-xs uppercase tracking-[0.3em] text-zinc-500 hover:text-red-500 transition"
      >
        ← Go Back
      </button>

      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          FORGE YOUR LEVEL
        </h1>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

        {/* PRO */}
        <div className="border border-zinc-800 rounded-3xl p-12 bg-black flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-zinc-400">
            PRO
          </h2>

          <div className="text-5xl font-black mb-8">
            ₹1900<span className="text-lg font-medium text-zinc-500"> / month</span>
          </div>

          <ul className="space-y-4 text-zinc-400 mb-12 flex-grow">
            <li>• 50 Scripts / Month</li>
            <li>• Fast Generation</li>
            <li>• Premium Tone Engine</li>
            <li>• Standard Support</li>
          </ul>

          <button
            onClick={() => handleSubscribe("pro")}
            className="w-full border border-zinc-700 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:border-red-600 hover:text-red-500 transition mt-auto"
          >
            Subscribe to Pro
          </button>
        </div>

        {/* ELITE */}
        <div className="border border-red-600 rounded-3xl p-12 bg-black flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-white">
            ELITE
          </h2>

          <div className="text-5xl font-black mb-8">
            ₹3900<span className="text-lg font-medium text-zinc-500"> / month</span>
          </div>

          <ul className="space-y-4 text-zinc-400 mb-12 flex-grow">
            <li>• Unlimited Scripts</li>
            <li>• Priority Speed</li>
            <li>• Advanced Psychological Mode</li>
            <li>• Future AI Upgrades</li>
          </ul>

          <button
            onClick={() => handleSubscribe("elite")}
            className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition mt-auto"
          >
            Subscribe to Elite
          </button>
        </div>

      </div>
    </div>
  );
}