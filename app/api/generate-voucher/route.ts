import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { hash } from "bcrypt";
import mongoose from "mongoose";

function generateRandomString(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, indexNumber } = await request.json();
    console.log("Received request to generate voucher:", {
      phoneNumber,
      indexNumber,
    });

    if (!phoneNumber || !indexNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number and index number are required.",
        },
        { status: 400 }
      );
    }

    const serialNumber = generateRandomString(8);
    const pin = generateRandomString(6);
    console.log("Generated credentials:", { serialNumber, pin });

    await connectToDatabase();
    console.log(
      "Connected to database. Connection state:",
      mongoose.connection.readyState
    );

    const existingCandidate = await Candidate.findOne({ indexNumber }).lean();
    console.log(
      "Existing candidate:",
      JSON.stringify(existingCandidate, null, 2)
    );

    if (!existingCandidate) {
      console.error("Candidate not found:", indexNumber);
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    const hashedPin = await hash(pin, 10);

    try {
      const updateData = {
        serialNumber,
        pin: hashedPin,
        phoneNumber,
        lastUpdated: new Date(),
      };

      const updatedCandidate = await Candidate.findOneAndUpdate(
        { indexNumber },
        { $set: updateData },
        { new: true, runValidators: true, lean: true }
      );

      console.log("Update result:", JSON.stringify(updatedCandidate, null, 2));

      if (!updatedCandidate) {
        console.error("Failed to update candidate:", indexNumber);
        return NextResponse.json(
          { success: false, error: "Failed to update candidate" },
          { status: 500 }
        );
      }

      if (!updatedCandidate.serialNumber || !updatedCandidate.pin) {
        console.error("Update failed: serialNumber or pin not set");
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update candidate with credentials",
          },
          { status: 500 }
        );
      }

      const smsContent = `Your login credentials for Peki Senior High School application:
Serial Number: ${serialNumber}
PIN: ${pin}`;

      console.log("Sending SMS to:", phoneNumber);
      console.log("SMS content:", smsContent);

      const smsResponse = await fetch(
        new URL("/api/send-sms", request.url).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: phoneNumber,
            content: smsContent,
          }),
        }
      );

      if (!smsResponse.ok) {
        const errorData = await smsResponse.json();
        console.error("SMS sending failed:", errorData);

        // Revert the database update if SMS sending fails
        await Candidate.findOneAndUpdate(
          { indexNumber },
          { $unset: { serialNumber: "", pin: "" }, $set: { phoneNumber: "" } },
          { new: true }
        );

        return NextResponse.json(
          { success: false, error: "Failed to send SMS. Please try again." },
          { status: 500 }
        );
      }

      const smsResult = await smsResponse.json();
      console.log("SMS sending result:", smsResult);

      if (!smsResult.success) {
        console.error("SMS sending failed");

        // Revert the database update if SMS sending fails
        await Candidate.findOneAndUpdate(
          { indexNumber },
          { $unset: { serialNumber: "", pin: "" }, $set: { phoneNumber: "" } },
          { new: true }
        );

        return NextResponse.json(
          { success: false, error: "Failed to send SMS. Please try again." },
          { status: 500 }
        );
      }

      console.log("Voucher generated and sent successfully");
      return NextResponse.json({
        success: true,
        message: "Voucher generated and sent successfully",
      });
    } catch (updateError) {
      console.error("Error updating candidate:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update candidate" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating and sending voucher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate and send voucher" },
      { status: 500 }
    );
  }
}
