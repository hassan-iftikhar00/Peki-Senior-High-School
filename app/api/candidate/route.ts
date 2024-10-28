import { NextResponse } from "next/server";
import Candidate from "@/models/Candidate";
import { connectToDatabase } from "@/lib/db";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const candidateData = await request.json();
    console.log(
      "Received candidate data:",
      JSON.stringify(candidateData, null, 2)
    );

    // Ensure all required fields are present
    const requiredFields = [
      "fullName",
      "indexNumber",
      "gender",
      "aggregate",
      "residence",
      "programme",
      "nhisNo",
      "enrollmentCode", // Add this line
      "passportPhoto",
    ];

    for (const field of requiredFields) {
      if (!candidateData[field]) {
        console.log(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Convert aggregate to a number if it's not already
    candidateData.aggregate = Number(candidateData.aggregate);

    // Convert classCapacity to a number
    if (
      candidateData.academicInfo &&
      candidateData.academicInfo.classCapacity
    ) {
      candidateData.academicInfo.classCapacity = Number(
        candidateData.academicInfo.classCapacity
      );
    }

    // Try to find an existing document with the same indexNumber
    const existingCandidate = await Candidate.findOne({
      indexNumber: candidateData.indexNumber,
    });

    if (existingCandidate) {
      // If the document exists, update it
      const updatedCandidate = await Candidate.findOneAndUpdate(
        { indexNumber: candidateData.indexNumber },
        candidateData,
        { new: true, runValidators: true }
      );

      return NextResponse.json(
        {
          message: "Candidate Data Updated Successfully!",
          candidate: updatedCandidate,
        },
        { status: 200 }
      );
    } else {
      // If the document doesn't exist, create a new one
      const newCandidate = new Candidate(candidateData);
      await newCandidate.save();

      return NextResponse.json(
        {
          message: "Candidate Data Saved Successfully!",
          candidate: newCandidate,
        },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    console.error("Error saving candidate data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to save candidate data.", details: errorMessage },
      { status: 500 }
    );
  }
}
