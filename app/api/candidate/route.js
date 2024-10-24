// app/api/candidate/route.js

import { NextResponse } from "next/server";
import Candidate from "@/models/Candidate";
import { connectToDatabase } from "@/lib/db";

export async function POST(request) {
  await connectToDatabase();

  try {
    const candidateData = await request.json();

    // Save candidate data to the database
    const newCandidate = new Candidate(candidateData);
    await newCandidate.save();

    return NextResponse.json(
      { message: "Candidate data saved successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving candidate data:", error);
    return NextResponse.json(
      { error: "Failed to save candidate data." },
      { status: 500 }
    );
  }
}
