// app/api/payment/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
  const { phoneNumber } = await request.json();
  const apiKey = "13232bce190c46e1bd71a3f9a642d51d";
  const apiId = "2oyn1P";

  // Here, you would implement the payment processing logic.
  // For demonstration purposes, let's assume the payment is successful.

  // Simulate a successful payment response
  return NextResponse.json({ success: true });
}
