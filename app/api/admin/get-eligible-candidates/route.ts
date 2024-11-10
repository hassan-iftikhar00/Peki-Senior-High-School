// app/api/get-eligible-candidates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const eligibleCandidates = await Candidate.find(
      { applicantNumber: { $exists: false } },
      "phoneNumber"
    ).lean();

    return NextResponse.json({
      success: true,
      candidates: eligibleCandidates,
    });
  } catch (error) {
    console.error("Error fetching eligible candidates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch eligible candidates" },
      { status: 500 }
    );
  }
}
