import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indexNumber = searchParams.get("indexNumber");

    if (!indexNumber) {
      return NextResponse.json(
        { error: "Index number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const candidate = await Candidate.findOne({ indexNumber });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const hasCredentials = Boolean(candidate.serialNumber && candidate.pin);

    return NextResponse.json({ hasCredentials });
  } catch (error) {
    console.error("Error checking credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
