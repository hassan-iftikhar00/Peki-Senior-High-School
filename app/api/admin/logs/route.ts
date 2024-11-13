import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AdminLog from "@/models/AdminLogs";
import CandidateLog from "@/models/CandidateLog";

const ITEMS_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);

    const Model = type === "admin" ? AdminLog : CandidateLog;

    const totalCount = await Model.countDocuments();
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const logs = await Model.find()
      .sort({ timeIn: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    return NextResponse.json({
      logs,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
