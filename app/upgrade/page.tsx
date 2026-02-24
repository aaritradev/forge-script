'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpgradePage({ credits = 0 }: { credits?: number }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"subscription" | "credits">("subscription");

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: "pro" | "elite" | "credit10" | "credit20") => {
    await loadRazorpay();

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!data.subscriptionId && !data.orderId) {
      alert("Payment creation failed");
      return;
    }

    const options = {
      key: data.key,
      ...(data.type === "subscription"
        ? { subscription_id: data.subscriptionId }
        : { order_id: data.orderId }),
      name: "ForgeScript",
      description:
        plan === "pro"
          ? "Pro Plan"
          : plan === "elite"
          ? "Elite Plan"
          : plan === "credit10"
          ? "10 Credits"
          : "20 Credits",

      handler: async function (response: any) {
        try {
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              selectedPlan: plan,
            }),
          });

          alert("Payment successful!");
          router.push("/");
        } catch (err) {
          console.error("Payment verification failed:", err);
          alert("Payment verification failed.");
        }
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

      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          FORGE YOUR LEVEL
        </h1>
      </div>

      <div className="max-w-6xl mx-auto flex gap-12">

        {/* LEFT SIDEBAR TABS */}
        <div className="w-48 flex flex-col space-y-4">
          <button
            onClick={() => setActiveTab("subscription")}
            className={`text-left px-4 py-3 rounded-xl border ${
              activeTab === "subscription"
                ? "border-red-600 text-red-500"
                : "border-zinc-800 text-zinc-400 hover:border-red-600"
            } transition`}
          >
            Subscription
          </button>

          <button
            onClick={() => setActiveTab("credits")}
            className={`text-left px-4 py-3 rounded-xl border ${
              activeTab === "credits"
                ? "border-red-600 text-red-500"
                : "border-zinc-800 text-zinc-400 hover:border-red-600"
            } transition`}
          >
            Credit Packs
          </button>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1">

          {activeTab === "subscription" && (
            <div className="grid md:grid-cols-2 gap-12">

              {/* PRO */}
              <div className="border border-zinc-800 rounded-3xl p-12 flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-zinc-400">PRO</h2>

                <div className="text-5xl font-black mb-8">
                  $19
                  <span className="text-lg font-medium text-zinc-500"> / month</span>
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
              <div className="border border-red-600 rounded-3xl p-12 flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-white">ELITE</h2>

                <div className="text-5xl font-black mb-8">
                  $39
                  <span className="text-lg font-medium text-zinc-500"> / month</span>
                </div>

                <ul className="space-y-4 text-zinc-400 mb-12 flex-grow">
                  <li>• 100 Scripts / Month</li>
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
          )}

          {activeTab === "credits" && (
            <div className="grid md:grid-cols-2 gap-12">

              <div className="border border-zinc-800 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold mb-4">10 Credits</h3>
                <div className="text-3xl font-black mb-6">$5</div>
                <button
                  onClick={() => handleSubscribe("credit10")}
                  className="w-full border border-zinc-700 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:border-red-600 hover:text-red-500 transition"
                >
                  Buy 10 Credits
                </button>
              </div>

              <div className="border border-zinc-800 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold mb-4">20 Credits</h3>
                <div className="text-3xl font-black mb-6">$10</div>
                <button
                  onClick={() => handleSubscribe("credit20")}
                  className="w-full border border-zinc-700 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:border-red-600 hover:text-red-500 transition"
                >
                  Buy 20 Credits
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}