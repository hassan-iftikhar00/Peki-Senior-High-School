import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Payment from "@/models/Payment";

const HUBTEL_API_URL = "https://payproxyapi.hubtel.com/items/initiate";
const MERCHANT_ACCOUNT_NUMBER = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID;
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET;

if (!MERCHANT_ACCOUNT_NUMBER || !HUBTEL_CLIENT_ID || !HUBTEL_CLIENT_SECRET) {
  throw new Error("Missing Hubtel credentials in environment variables");
}

export async function POST(request: NextRequest) {
  try {
    const { totalAmount, description, indexNumber } = await request.json();

    const clientReference = `PEKI-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    const paymentData = {
      totalAmount,
      description,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payment-callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_API_URL}/payment-status?indexNumber=${indexNumber}&clientReference=${clientReference}`,
      cancellationUrl: `${process.env.NEXT_PUBLIC_API_URL}/payment-cancelled`,
      merchantAccountNumber: MERCHANT_ACCOUNT_NUMBER,
      clientReference,
    };

    const authString = Buffer.from(
      `${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(HUBTEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(
        `Hubtel API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.responseCode === "0000") {
      await connectToDatabase();
      await Payment.create({
        indexNumber,
        clientReference,
        amount: totalAmount,
        status: "pending",
        checkoutId: data.data.checkoutId,
      });

      return NextResponse.json({
        success: true,
        checkoutDirectUrl: data.data.checkoutDirectUrl,
        clientReference,
      });
    } else {
      throw new Error(data.message || "Failed to initiate payment");
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
