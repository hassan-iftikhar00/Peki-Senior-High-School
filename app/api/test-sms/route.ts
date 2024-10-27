// import { NextRequest, NextResponse } from "next/server";

// const CLIENT_ID = process.env.HUBTEL_CLIENT_ID_SMS;
// const CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET_SMS;
// const API_URL = "https://sms.hubtel.com/v1/messages/send";
// const SENDER_ID = "PekiSHS";

// if (!CLIENT_ID || !CLIENT_SECRET) {
//   throw new Error("Missing Hubtel credentials in environment variables");
// }

// export async function GET(request: NextRequest) {
//   const phoneNumber = request.nextUrl.searchParams.get("phone");
//   if (!phoneNumber) {
//     return NextResponse.json(
//       { error: "Phone number is required" },
//       { status: 400 }
//     );
//   }

//   const testMessage =
//     "This is a test SMS from Peki Senior High School application.";

//   try {
//     const result = await sendSMS(phoneNumber, testMessage);
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error in test SMS route:", error);
//     return NextResponse.json(
//       { error: "Failed to send test SMS" },
//       { status: 500 }
//     );
//   }
// }

// async function sendSMS(to: string, content: string) {
//   let formattedNumber = to.replace(/\D/g, "");
//   if (formattedNumber.startsWith("0")) {
//     formattedNumber = "233" + formattedNumber.slice(1);
//   } else if (!formattedNumber.startsWith("233")) {
//     formattedNumber = "233" + formattedNumber;
//   }

//   const params = new URLSearchParams();
//   params.append("clientid", CLIENT_ID!);
//   params.append("clientsecret", CLIENT_SECRET!);
//   params.append("from", SENDER_ID);
//   params.append("to", formattedNumber);
//   params.append("content", content);

//   const url = `${API_URL}?${params.toString()}`;

//   const response = await fetch(url, {
//     method: "GET",
//     headers: { "Cache-Control": "no-cache" },
//   });

//   const responseData = await response.json();

//   if (responseData.status !== 0) {
//     throw new Error(`SMS sending failed: ${JSON.stringify(responseData)}`);
//   }

//   return { success: true, messageId: responseData.messageId };
// }

// export { sendSMS };
