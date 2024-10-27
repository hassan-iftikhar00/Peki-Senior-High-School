import { NextRequest, NextResponse } from "next/server";

const HUBTEL_TEST_URL = "https://api-txnstatus.hubtel.com/transactions";
const MERCHANT_ACCOUNT_NUMBER = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID;
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET;

if (!MERCHANT_ACCOUNT_NUMBER || !HUBTEL_CLIENT_ID || !HUBTEL_CLIENT_SECRET) {
  throw new Error("Missing Hubtel credentials in environment variables");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transactionId"); // Get POS Sales ID from query parameters
  const clientReference = searchParams.get("clientReference"); // Get clientReference from query parameters

  if (!transactionId && !clientReference) {
    return NextResponse.json(
      { error: "At least one of transactionId or clientReference is required" },
      { status: 400 }
    );
  }

  // Build the request URL with transactionId
  const HUBTEL_URL = `${HUBTEL_TEST_URL}/${transactionId}/status${
    clientReference ? `?clientReference=${clientReference}` : ""
  }`;

  try {
    const authString = Buffer.from(
      `${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(HUBTEL_URL, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Cache-Control": "no-cache",
      },
    });

    // Check if the response status indicates an error
    if (!response.ok) {
      const errorResponse = await response.json(); // Try to parse error response
      return NextResponse.json(
        {
          error:
            errorResponse.message || "Failed to retrieve transaction status",
          responseCode: errorResponse.responseCode,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json(); // Parse the successful response

    return NextResponse.json({
      status: response.status,
      data: responseData.data,
      message: responseData.message,
    });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message; // Accessing the message property
      console.error("Hubtel connection test error:", error.message);
    } else {
      console.error("Hubtel connection test error:", error);
    }

    return NextResponse.json(
      {
        error: "Failed to test Hubtel connection",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
