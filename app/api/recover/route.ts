import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import bcrypt from "bcrypt";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const indexNumber = searchParams.get("indexNumber");
  console.log("Received index number:", indexNumber);

  if (!indexNumber) {
    return NextResponse.json(
      { success: false, error: "Index number is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    console.log("Connected to MongoDB");

    const candidate = await Candidate.findOne({ indexNumber });

    if (!candidate) {
      console.log("No candidate found for the provided index number");
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    console.log("Candidate found:", JSON.stringify(candidate, null, 2));

    // Generate a new PIN
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the new PIN
    const hashedNewPin = await bcrypt.hash(newPin, 10);

    // Update the candidate's PIN in the database
    await Candidate.updateOne(
      { _id: candidate._id },
      { $set: { pin: hashedNewPin } }
    );

    return NextResponse.json({
      success: true,
      serialNumber: candidate.serialNumber || "Not set",
      pin: newPin,
      message: "Login information retrieved and PIN reset successfully",
    });
  } catch (error) {
    console.error("Error in recover login:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while recovering login information",
      },
      { status: 500 }
    );
  }
}
