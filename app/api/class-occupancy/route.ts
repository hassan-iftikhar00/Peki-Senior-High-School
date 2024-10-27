import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function GET() {
  await connectToDatabase();

  try {
    const candidates = await Candidate.find(
      {},
      "programme academicInfo.selectedClass"
    );

    const occupancy: Record<string, Record<string, number>> = {};

    candidates.forEach((candidate) => {
      if (candidate.programme && candidate.academicInfo?.selectedClass) {
        if (!occupancy[candidate.programme]) {
          occupancy[candidate.programme] = {};
        }
        if (
          !occupancy[candidate.programme][candidate.academicInfo.selectedClass]
        ) {
          occupancy[candidate.programme][
            candidate.academicInfo.selectedClass
          ] = 0;
        }
        occupancy[candidate.programme][candidate.academicInfo.selectedClass]++;
      }
    });

    return NextResponse.json({ occupancy });
  } catch (error) {
    console.error("Error fetching class occupancy:", error);
    return NextResponse.json(
      { error: "Failed to fetch class occupancy" },
      { status: 500 }
    );
  }
}
