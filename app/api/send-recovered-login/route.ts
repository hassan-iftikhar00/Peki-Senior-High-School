import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { hash } from "bcrypt";

function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  console.log("Received request to send recovered login info");
  try {
    const { indexNumber } = await request.json();
    console.log("Index number received:", indexNumber);

    if (!indexNumber) {
      console.log("Index number is missing");
      return NextResponse.json(
        { success: false, error: "Index number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log("Connected to database");

    const candidate = await Candidate.findOne({ indexNumber });

    if (!candidate) {
      console.log("Candidate not found");
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (!candidate.phoneNumber) {
      console.log("Candidate phone number not found");
      return NextResponse.json(
        { success: false, error: "Candidate phone number not found" },
        { status: 400 }
      );
    }

    // Generate a new PIN
    const newPin = generateRandomString(6);
    const hashedPin = await hash(newPin, 10);

    // Update the candidate's PIN in the database
    candidate.pin = hashedPin;
    await candidate.save();

    console.log("Candidate found, preparing SMS content");
    const smsContent = `Your updated login credentials for Peki Senior High School application:
Serial Number: ${candidate.serialNumber}
New PIN: ${newPin}`;

    console.log("Sending SMS");
    const smsResponse = await fetch(
      new URL("/api/send-sms", request.url).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: candidate.phoneNumber,
          content: smsContent,
        }),
      }
    );

    if (!smsResponse.ok) {
      const errorData = await smsResponse.json();
      console.error("SMS sending failed:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to send SMS. Please try again." },
        { status: 500 }
      );
    }

    const smsResult = await smsResponse.json();

    if (!smsResult.success) {
      console.error("SMS sending failed");
      return NextResponse.json(
        { success: false, error: "Failed to send SMS. Please try again." },
        { status: 500 }
      );
    }

    console.log("SMS sent successfully");
    return NextResponse.json({
      success: true,
      message: "Login information sent successfully",
    });
  } catch (error) {
    console.error("Error sending recovered login info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while sending login information",
      },
      { status: 500 }
    );
  }
}
