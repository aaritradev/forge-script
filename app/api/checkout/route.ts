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

  if (!["pro", "elite"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const planId =
    plan === "pro"
      ? process.env.RAZORPAY_PRO_PLAN_ID
      : process.env.RAZORPAY_ELITE_PLAN_ID;

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId!,
    customer_notify: 1,
    notes: {
      email: session.user.email,
      plan,
    },
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    key: process.env.RAZORPAY_KEY_ID,
  });
}