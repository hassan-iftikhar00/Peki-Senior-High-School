import { NextRequest, NextResponse } from "next/server";

const HUBTEL_STATUS_CHECK_URL = "https://api-txnstatus.hubtel.com/transactions";
const MERCHANT_ACCOUNT_NUMBER = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID;
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET;

if (!MERCHANT_ACCOUNT_NUMBER || !HUBTEL_CLIENT_ID || !HUBTEL_CLIENT_SECRET) {
  throw new Error("Missing Hubtel credentials in environment variables");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientReference = searchParams.get("clientReference");

  if (!clientReference) {
    return NextResponse.json(
      { success: false, error: "Client reference is required" },
      { status: 400 }
    );
  }

  try {
    const authString = Buffer.from(
      `${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`
    ).toString("base64");
    console.log("Auth string (base64):", authString);
    console.log("MERCHANT_ACCOUNT_NUMBER:", MERCHANT_ACCOUNT_NUMBER);
    console.log("HUBTEL_CLIENT_ID:", HUBTEL_CLIENT_ID);
    console.log(
      "HUBTEL_CLIENT_SECRET:",
      HUBTEL_CLIENT_SECRET ? "[REDACTED]" : "Not set"
    );

    const url = `${HUBTEL_STATUS_CHECK_URL}/${MERCHANT_ACCOUNT_NUMBER}/status?clientReference=${clientReference}`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Cache-Control": "no-cache",
      },
    });

    console.log("Hubtel API Response Status:", response.status);
    console.log(
      "Hubtel API Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Hubtel API Response:", responseText);

    if (response.status === 403) {
      console.error(
        "Access forbidden. Please check your Hubtel credentials and permissions."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Access forbidden. Please check your Hubtel credentials and permissions.",
          debug: {
            url,
            authStringLength: authString.length,
            merchantAccountNumber: MERCHANT_ACCOUNT_NUMBER,
          },
        },
        { status: 403 }
      );
    }

    if (!response.ok) {
      throw new Error(
        `Hubtel API error: ${response.status} ${response.statusText}`
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Hubtel API response:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from payment provider",
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: data.data.status,
      transactionId: data.data.transactionId,
      amount: data.data.amount,
      paymentMethod: data.data.paymentMethod,
      date: data.data.date,
    });
  } catch (error: unknown) {
    console.error("Payment status check error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check payment status",
        details: errorMessage,
        debug: {
          merchantAccountNumber: MERCHANT_ACCOUNT_NUMBER,
          clientIdSet: !!HUBTEL_CLIENT_ID,
          clientSecretSet: !!HUBTEL_CLIENT_SECRET,
        },
      },
      { status: 500 }
    );
  }
}
