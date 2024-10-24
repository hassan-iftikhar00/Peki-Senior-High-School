import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = "gukisadt";
const CLIENT_SECRET = "ulapfgeb";
const API_URL =
  "https://sms.hubtel.com/v1/messages/send?clientsecret=ulapfgeb&clientid=gukisadt&from=PekiSHS&to=&content=This+Is+A+Test+Message";
const SENDER_ID = "PacketsOut";

export async function POST(request: NextRequest) {
  try {
    const { to, content } = await request.json();

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

      if (responseData.status === 12) {
        return NextResponse.json(
          {
            error:
              "SMS service account requires payment. Please contact the administrator.",
          },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: "Failed to send SMS", details: responseData },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Error sending SMS" }, { status: 500 });
  }
}
