import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const houseName = url.searchParams.get("houseName");

    if (!houseName) {
      return NextResponse.json(
        { error: "House name is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const students = await Candidate.find({
      $or: [{ houseAssigned: houseName }, { houseName: houseName }],
    })
      .select("fullName indexNumber")
      .lean();

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching house students:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching house students" },
      { status: 500 }
    );
  }
}
