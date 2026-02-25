import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  // 🔵 SUBSCRIPTIONS
  if (plan === "pro" || plan === "elite") {

    const planId =
      plan === "pro"
        ? process.env.RAZORPAY_PRO_PLAN_ID!
        : process.env.RAZORPAY_ELITE_PLAN_ID!;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
      notes: {
        email: session.user.email,
        plan,
      },
    });

    return NextResponse.json({
      type: "subscription",
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  }

  // 🟢 CREDIT PACKS (ONE-TIME ORDER)
  if (plan === "credit10" || plan === "credit20") {

    const amount =
      plan === "credit10" ? 500 : 1000; // ₹5 or ₹10 equivalent (in paise)

    const order = await razorpay.orders.create({
      amount,
      currency: "USD",
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: session.user.email,
        plan,
      },
    });

    return NextResponse.json({
      type: "order",
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  }

  return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
}