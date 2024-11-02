import { NextRequest, NextResponse } from "next/server";

const HUBTEL_API_URL =
  "https://devp-reqsendmoney-230622-api.hubtel.com/request-money";
const HUBTEL_USERNAME = "2oyn1P";
const HUBTEL_PASSWORD = "13232bce190c46e1bd71a3f9a642d51d";

export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();

  const paymentData = {
    amount: 60, // Set the amount for the application voucher
    title: "Peki Senior High School Application Voucher",
    description: "Payment for application voucher",
    clientReference: `PEKI-${Date.now()}`,
    callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payment-callback`,
    returnUrl: `${process.env.NEXT_PUBLIC_API_URL}/payment-success`,
    cancellationUrl: `${process.env.NEXT_PUBLIC_API_URL}/payment-cancelled`,
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg",
  };

  try {
    const response = await fetch(`${HUBTEL_API_URL}/${phoneNumber}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${HUBTEL_USERNAME}:${HUBTEL_PASSWORD}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error("Payment request failed");
    }

    const data = await response.json();
    return NextResponse.json({ success: true, paymentUrl: data.paylinkUrl });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, error: "Payment request failed" },
      { status: 500 }
    );
  }
}
