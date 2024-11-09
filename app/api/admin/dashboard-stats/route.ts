import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

function verifyJWT(token: string): { isValid: boolean; payload: any } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { isValid: true, payload: decoded };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { isValid: false, payload: null };
  }
}

export async function GET(request: NextRequest) {
  console.log("Admin dashboard API: GET request received");
  try {
    const token = request.cookies.get("adminToken")?.value;
    console.log(
      "Admin dashboard API: Token from cookie:",
      token ? "Present" : "Not present"
    );

    if (!token) {
      console.log("Admin dashboard API: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const { isValid, payload } = verifyJWT(token);
    if (!isValid || !payload || payload.role !== "admin") {
      console.log("Admin dashboard API: Invalid token or not an admin");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Admin dashboard API: Token verified successfully");

    await connectToDatabase();
    console.log("Admin dashboard API: Connected to database");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [dashboardStats, completionTrend, completedStudents] =
      await Promise.all([
        Candidate.aggregate([
          {
            $facet: {
              totalCounts: [
                {
                  $group: {
                    _id: null,
                    totalCandidates: { $sum: 1 },
                    totalSubmitted: {
                      $sum: {
                        $cond: [
                          { $ifNull: ["$applicationNumber", false] },
                          1,
                          0,
                        ],
                      },
                    },
                  },
                },
              ],
              genderCounts: [
                {
                  $match: { applicationNumber: { $exists: true, $ne: null } },
                },
                {
                  $group: {
                    _id: { $toLower: "$gender" },
                    count: { $sum: 1 },
                  },
                },
              ],
              residenceCounts: [
                {
                  $match: { applicationNumber: { $exists: true, $ne: null } },
                },
                {
                  $group: {
                    _id: { $toLower: "$residence" },
                    count: { $sum: 1 },
                  },
                },
              ],
            },
          },
        ]),
        Candidate.aggregate([
          {
            $match: {
              applicationNumber: {
                $exists: true,
                $ne: null,
                $regex: /^\d{6}-\d+$/, // Ensure the application number format is correct
              },
            },
          },
          {
            $addFields: {
              applicationDate: {
                $let: {
                  vars: {
                    day: { $substr: ["$applicationNumber", 0, 2] },
                    month: { $substr: ["$applicationNumber", 2, 2] },
                    year: { $substr: ["$applicationNumber", 4, 2] },
                  },
                  in: {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ["$$day", ""] },
                          { $ne: ["$$month", ""] },
                          { $ne: ["$$year", ""] },
                          { $gte: [{ $toInt: "$$day" }, 1] },
                          { $lte: [{ $toInt: "$$day" }, 31] },
                          { $gte: [{ $toInt: "$$month" }, 1] },
                          { $lte: [{ $toInt: "$$month" }, 12] },
                        ],
                      },
                      then: {
                        $dateFromString: {
                          dateString: {
                            $concat: [
                              "20",
                              "$$year",
                              "-",
                              "$$month",
                              "-",
                              "$$day",
                            ],
                          },
                          format: "%Y-%m-%d",
                        },
                      },
                      else: null,
                    },
                  },
                },
              },
            },
          },
          {
            $match: {
              applicationDate: {
                $ne: null,
                $gte: thirtyDaysAgo,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$applicationDate" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Candidate.find(
          { applicationNumber: { $exists: true, $ne: null } },
          "fullName applicationNumber"
        )
          .sort({ applicationNumber: -1 })
          .limit(10)
          .lean(),
      ]);

    const { totalCounts, genderCounts, residenceCounts } = dashboardStats[0];
    const { totalCandidates, totalSubmitted } = totalCounts[0];

    const maleStudents =
      genderCounts.find((g: { _id: string }) => g._id === "male")?.count || 0;
    const femaleStudents =
      genderCounts.find((g: { _id: string }) => g._id === "female")?.count || 0;
    const boarders =
      residenceCounts.find((r: { _id: string }) => r._id === "boarding")
        ?.count || 0;
    const dayStudents =
      residenceCounts.find((r: { _id: string }) => r._id === "day")?.count || 0;

    // Fill in missing days with zero counts
    const trend = Array(30).fill(0);
    completionTrend.forEach((day) => {
      const index =
        29 -
        Math.floor(
          (Date.now() - new Date(day._id).getTime()) / (24 * 60 * 60 * 1000)
        );
      if (index >= 0 && index < 30) {
        trend[index] = day.count;
      }
    });

    const dashboardData = {
      totalCandidates,
      totalSubmitted,
      maleStudents,
      femaleStudents,
      boarders,
      dayStudents,
      completionTrend: trend,
      completedStudents,
    };

    console.log(
      "Admin dashboard API: Sending dashboard data",
      JSON.stringify(dashboardData, null, 2)
    );
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Admin dashboard API: Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
