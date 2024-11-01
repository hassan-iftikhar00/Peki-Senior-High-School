import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function POST(request: NextRequest) {
  try {
    const { checkoutId, indexNumber } = await request.json();
    console.log("Received update request for:", { checkoutId, indexNumber });

    await connectToDatabase();

    const updatedCandidate = await Candidate.findOneAndUpdate(
      { indexNumber: indexNumber },
      { $set: { feePaid: true } },
      { new: true }
    );

    if (updatedCandidate) {
      console.log(
        "Updated candidate:",
        JSON.stringify(updatedCandidate, null, 2)
      );
      return NextResponse.json({
        success: true,
        message: "Payment status updated successfully",
      });
    } else {
      console.log("Candidate not found for index number:", indexNumber);
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
