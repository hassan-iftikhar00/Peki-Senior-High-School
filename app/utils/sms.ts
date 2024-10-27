import { NextResponse } from "next/server";

const CLIENT_ID = "gukisadt";
const CLIENT_SECRET = "ulapfgeb";
const API_URL = "https://sms.hubtel.com/v1/messages/send";
const SENDER_ID = "PacketsOut";

export async function sendSMS(to: string, content: string) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: JSON.stringify({
        from: SENDER_ID,
        to: to,
        content: content,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Failed to send SMS:", responseData);
      throw new Error(responseData.message || "Failed to send SMS");
    }

    return responseData;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}
