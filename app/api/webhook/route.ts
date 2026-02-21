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

    // 🔵 Subscription Activated (first successful payment)
    if (event.event === "subscription.activated") {
      const sub = event.payload.subscription.entity;

      await prisma.user.update({
        where: { email: sub.notes.email },
        data: {
          plan: sub.notes.plan,
          subscriptionId: sub.id,
          subscriptionStatus: "active",
          credits: sub.notes.plan === "pro" ? 50 : 999999,
        },
      });
    }

    // 🔵 Subscription Charged (monthly renewal)
    if (event.event === "subscription.charged") {
      const sub = event.payload.subscription.entity;

      if (sub.notes.plan === "pro") {
        await prisma.user.update({
          where: { email: sub.notes.email },
          data: {
            credits: 50, // monthly refill
          },
        });
      }
    }

    // 🔴 Subscription Cancelled
    if (event.event === "subscription.completed") {
      const subscription = event.payload.subscription.entity;

    await prisma.user.update({
      where: { subscriptionId: subscription.id },
      data: {
        plan: "free",
        subscriptionStatus: "expired",
        subscriptionId: null,
        credits: 3,
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}