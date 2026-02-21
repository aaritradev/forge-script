import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    selectedPlan,
  } = body;

  // Verify signature
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Update based on purchased plan
  if (selectedPlan === "pro") {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        plan: "pro",
        credits: 50,
      },
    });
  }

  if (selectedPlan === "elite") {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        plan: "elite",
      },
    });
  }

  return NextResponse.json({ success: true });
}