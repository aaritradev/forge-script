import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plan } = await req.json();

    // ✅ Use consistent naming with DB
    if (!plan || !["pro", "elite"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Payment configuration missing" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // 💰 INR pricing (recommended)
    const amount =
      plan === "pro"
        ? 1900 * 100 // ₹1900
        : 3900 * 100; // ₹3900

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `forge_${plan}_${Date.now()}`,
      notes: {
        email: session.user.email,
        plan,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id,
      plan, // important for frontend
    });

  } catch (error) {
    console.error("Checkout Error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}