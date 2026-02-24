import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (!event?.event) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    // 🔵 SUBSCRIPTION ACTIVATED
    if (event.event === "subscription.activated") {
      const sub = event.payload.subscription.entity;

      await prisma.user.update({
        where: { email: sub.notes.email },
        data: {
          plan: sub.notes.plan,
          subscriptionId: sub.id,
          subscriptionStatus: "active",
          monthlyCredits: sub.notes.plan === "pro" ? 50 : 100,
          lastCreditReset: new Date(),
        },
      });
    }

// 🔵 MONTHLY RENEWAL
if (event.event === "subscription.charged") {
  const sub = event.payload.subscription.entity;

  await prisma.user.update({
    where: { email: sub.notes.email },
    data: {
      monthlyCredits: sub.notes.plan === "pro" ? 50 : 100,
      lastCreditReset: new Date(),
    },
  });
}

// 🔴 SUBSCRIPTION CANCELLED
if (event.event === "subscription.completed") {
  const sub = event.payload.subscription.entity;

  await prisma.user.update({
    where: { email: sub.notes.email },
    data: {
      plan: "free",
      subscriptionStatus: "expired",
      subscriptionId: null,
      monthlyCredits: 0,
    },
  });
}

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}