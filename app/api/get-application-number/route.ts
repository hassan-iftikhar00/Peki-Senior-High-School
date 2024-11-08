import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function GET() {
  try {
    await connectToDatabase();

    // Get the current date
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    // Find the highest application number for today
    const highestToday = await Candidate.findOne(
      {
        applicationNumber: new RegExp(`^${day}${month}${year}-`),
      },
      "applicationNumber"
    )
      .sort({ applicationNumber: -1 })
      .lean();

    let nextNumber = 1;
    if (highestToday && highestToday.applicationNumber) {
      const lastNumber = parseInt(highestToday.applicationNumber.split("-")[1]);
      nextNumber = lastNumber + 1;
    }

    // Generate the application number
    const applicationNumber = `${day}${month}${year}-${String(
      nextNumber
    ).padStart(4, "0")}`;

    return NextResponse.json({ applicationNumber, position: nextNumber });
  } catch (error) {
    console.error("Error generating application number:", error);
    return NextResponse.json(
      { error: "Failed to generate application number" },
      { status: 500 }
    );
  }
}
