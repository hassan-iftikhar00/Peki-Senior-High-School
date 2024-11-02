import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function POST(request: Request) {
  const { indexNumber } = await request.json();

  try {
    await connectToDatabase();

    const candidate = await Candidate.findOne({ indexNumber });

    if (candidate) {
      console.log("Found candidate:", JSON.stringify(candidate, null, 2));
      console.log("feePaid value:", candidate.feePaid);
      return NextResponse.json({
        verified: true,
        candidateInfo: {
          fullName: candidate.fullName,
          indexNumber: candidate.indexNumber,
          programme: candidate.programme,
          gender: candidate.gender,
          houseAssigned: candidate.houseAssigned || "",
          residence: candidate.residence,
          aggregate: candidate.aggregate,
          feePaid: candidate.feePaid, // Ensure this field is included
        },
      });
    } else {
      console.log("Candidate not found for index number:", indexNumber);
      return NextResponse.json({ verified: false }, { status: 404 });
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
