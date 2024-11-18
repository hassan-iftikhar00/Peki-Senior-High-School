import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { indexNumber, houseId, houseName } = await request.json();

    const updatedCandidate = await Candidate.findOneAndUpdate(
      { indexNumber },
      { $set: { houseId, houseAssigned: houseName } },
      { new: true }
    );

    if (!updatedCandidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "House assignment updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating house assignment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
