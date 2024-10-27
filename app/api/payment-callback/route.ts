import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();

    // Log the callback data for debugging
    console.log("Payment callback received:", callbackData);

    // Process the callback data
    if (
      callbackData.ResponseCode === "0000" &&
      callbackData.Status === "Success"
    ) {
      // Payment was successful
      const { ClientReference, Amount, CustomerPhoneNumber } =
        callbackData.Data;

      // TODO: Update your database with the payment information
      // For example, mark the payment as completed for the given ClientReference

      // Send a message to the client-side
      if (typeof window !== "undefined") {
        window.postMessage(
          {
            type: "PAYMENT_CALLBACK",
            payload: callbackData.Data,
          },
          window.location.origin
        );
      }

      return NextResponse.json({
        success: true,
        message: "Callback processed successfully",
      });
    } else {
      // Payment failed or has an unknown status
      console.error("Payment failed or has unknown status:", callbackData);
      return NextResponse.json(
        { success: false, error: "Payment failed or has unknown status" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing payment callback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment callback" },
      { status: 500 }
    );
  }
}
