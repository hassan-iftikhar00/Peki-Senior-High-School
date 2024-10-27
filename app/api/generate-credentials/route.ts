import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/app/utils/sms"; // Implement this function to send SMS

function generateCredentials() {
  const serial = Math.random().toString(36).substr(2, 8).toUpperCase();
  const pin = Math.random().toString().substr(2, 6);
  return { serial, pin };
}

export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();

  const { serial, pin } = generateCredentials();

  try {
    // Save credentials to database (implement this)
    await saveCredentialsToDatabase(phoneNumber, serial, pin);

    // Send SMS with credentials
    const message = `Your login credentials for Peki Senior High School application:\nSerial: ${serial}\nPIN: ${pin}`;
    await sendSMS(phoneNumber, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error generating credentials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate credentials" },
      { status: 500 }
    );
  }
}

async function saveCredentialsToDatabase(
  phoneNumber: string,
  serial: string,
  pin: string
) {
  // Implement database saving logic here
  // This is a placeholder function
  console.log(
    `Saving credentials for ${phoneNumber}: Serial: ${serial}, PIN: ${pin}`
  );
}
