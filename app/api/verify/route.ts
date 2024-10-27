import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function POST(request: Request) {
  const { indexNumber } = await request.json();

  try {
    await connectToDatabase();

    const candidate = await Candidate.findOne({ indexNumber });

    if (candidate) {
      return NextResponse.json({
        verified: true,
        candidateInfo: {
          fullName: candidate.fullName,
          indexNumber: candidate.indexNumber,
          programme: candidate.programme,
          gender: candidate.gender,
          residence: candidate.residence,
          aggregate: candidate.aggregate,
        },
      });
    } else {
      return NextResponse.json({ verified: false }, { status: 404 });
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
