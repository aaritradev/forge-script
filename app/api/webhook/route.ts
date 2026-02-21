import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text(); // IMPORTANT: raw body
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

    // Only act on successful payment
    if (event.event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const payment = event.payload.payment.entity;
    const notes = payment.notes;

    const email = notes.email;
    const plan = notes.plan;

    if (!email || !plan) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    if (plan === "pro") {
      await prisma.user.update({
        where: { email },
        data: {
          plan: "pro",
          credits: 50,
        },
      });
    }

    if (plan === "elite") {
      await prisma.user.update({
        where: { email },
        data: {
          plan: "elite",
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}