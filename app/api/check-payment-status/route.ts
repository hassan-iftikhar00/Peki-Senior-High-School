import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Payment from "@/models/Payment";
import Candidate from "@/models/Candidate";

const HUBTEL_STATUS_CHECK_URL =
  "https://rmsc.hubtel.com/v1/merchantaccount/merchants";
const MERCHANT_ACCOUNT_NUMBER = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID;
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET;

if (!MERCHANT_ACCOUNT_NUMBER || !HUBTEL_CLIENT_ID || !HUBTEL_CLIENT_SECRET) {
  throw new Error("Missing Hubtel credentials in environment variables");
}

const rateLimitMap = new Map<string, number>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientReference = searchParams.get("clientReference");

  if (!clientReference) {
    return NextResponse.json(
      { success: false, error: "Client reference is required" },
      { status: 400 }
    );
  }

  // Implement rate limiting
  const now = Date.now();
  const lastCallTime = rateLimitMap.get(clientReference) || 0;
  if (now - lastCallTime < 30000) {
    // 30 seconds cooldown
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }
  rateLimitMap.set(clientReference, now);

  try {
    await connectToDatabase();
    const payment = await Payment.findOne({ clientReference });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    const authString = Buffer.from(
      `${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`
    ).toString("base64");
    const url = `${HUBTEL_STATUS_CHECK_URL}/${MERCHANT_ACCOUNT_NUMBER}/transactions/status?clientReference=${clientReference}`;

    console.log("Requesting URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Cache-Control": "no-cache",
      },
    });

    const responseData = await response.json();
    console.log("Hubtel API response:", JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.ResponseCode === "0000") {
      const transactionData = responseData.Data[0];
      if (transactionData.TransactionStatus === "Success") {
        payment.status = "completed";
        await payment.save();

        await Candidate.findOneAndUpdate(
          { indexNumber: payment.indexNumber },
          { $set: { feePaid: true } }
        );

        return NextResponse.json({
          success: true,
          status: "completed",
          message: "Payment successful",
        });
      } else if (transactionData.TransactionStatus === "Failed") {
        payment.status = "failed";
        await payment.save();

        return NextResponse.json({
          success: false,
          status: "failed",
          message: "Payment failed",
        });
      } else {
        return NextResponse.json({
          success: false,
          status: "pending",
          message: "Payment is still pending",
        });
      }
    } else if (
      response.status === 429 ||
      responseData.ResponseCode === "4290"
    ) {
      return NextResponse.json({
        success: false,
        status: "rate_limited",
        message: "Too many requests. Please try again later.",
      });
    } else {
      throw new Error(
        `Hubtel API error: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check payment status",
        details: {
          clientReference,
          merchantAccountNumber: MERCHANT_ACCOUNT_NUMBER,
          hubtelClientIdSet: !!HUBTEL_CLIENT_ID,
          hubtelClientSecretSet: !!HUBTEL_CLIENT_SECRET,
        },
      },
      { status: 500 }
    );
  }
}
