import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = "jziuefzr";
const CLIENT_SECRET = "fevmnxnq";
const API_URL = "https://sms.hubtel.com/v1/messages/send";
const SENDER_ID = "PekiSHS";

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Missing Hubtel credentials in environment variables");
}

export async function POST(request: NextRequest) {
  try {
    const { to, content } = await request.json();

    console.log("Received SMS request - To:", to, "Content:", content);

    if (!to || !content) {
      console.error("Missing recipient phone number or message content");
      return NextResponse.json(
        {
          success: false,
          error: "Recipient phone number and message content are required.",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.append("clientid", CLIENT_ID);
    params.append("clientsecret", CLIENT_SECRET);
    params.append("from", SENDER_ID);
    params.append("to", to);
    params.append("content", content);

    const url = `${API_URL}?${params.toString()}`;

    console.log("Hubtel API URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Cache-Control": "no-cache" },
    });

    console.log("Hubtel API Response Status:", response.status);
    console.log(
      "Hubtel API Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Hubtel API Response Text:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse Hubtel API response:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from SMS provider",
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    console.log(
      "Hubtel API Response Data:",
      JSON.stringify(responseData, null, 2)
    );

    if (responseData.status !== 0) {
      console.error("Failed to send SMS:", responseData);
      return NextResponse.json(
        { success: false, error: "Failed to send SMS", details: responseData },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: responseData.messageId,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { success: false, error: "Error sending SMS" },
      { status: 500 }
    );
  }
}
