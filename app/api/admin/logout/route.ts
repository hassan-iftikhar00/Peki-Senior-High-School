import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear both applicant and admin tokens
    response.cookies.delete("token");
    response.cookies.delete("adminToken");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
