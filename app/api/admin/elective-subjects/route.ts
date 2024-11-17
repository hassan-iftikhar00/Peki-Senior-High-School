import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Programme from "@/models/Programme";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programme = searchParams.get("programme");

    if (!programme) {
      return NextResponse.json(
        { error: "Programme is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const programmeData = await Programme.findOne({ name: programme });
    if (!programmeData) {
      return NextResponse.json(
        { error: "Programme not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      electiveSubjects: programmeData.electiveSubjects,
    });
  } catch (error) {
    console.error("Error fetching elective subjects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
