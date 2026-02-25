import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Cancel subscription immediately
    await razorpay.subscriptions.cancel(user.subscriptionId);

    // Update DB
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionStatus: "cancelled",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: error?.message || "Cancellation failed" },
      { status: 500 }
    );
  }
}