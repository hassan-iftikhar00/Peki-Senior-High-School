import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import bcrypt from "bcrypt";

async function hashPin(pin: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      indexNumber,
      serialNumber,
      pin,
      fullName,
      programme /* other fields */,
    } = body;

    await connectToDatabase();

    // Hash the PIN before storing it
    const hashedPin = await hashPin(pin);

    const newCandidate = new Candidate({
      indexNumber,
      serialNumber,
      pin: hashedPin,
      fullName,
      programme,
      // ... other fields
    });

    await newCandidate.save();

    return NextResponse.json({
      success: true,
      message: "Candidate registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
