import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const MERCHANT_ACCOUNT_NUMBER = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
  const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID;
  const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET;

  return NextResponse.json({
    merchantAccountNumber: MERCHANT_ACCOUNT_NUMBER,
    clientId: HUBTEL_CLIENT_ID,
    clientSecret: HUBTEL_CLIENT_SECRET ? "Set" : "Not set",
    base64Auth: Buffer.from(
      `${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`
    ).toString("base64"),
  });
}
