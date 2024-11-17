import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import Class from "@/models/Class";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

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

interface IClass {
  _id: Types.ObjectId;
  name: string;
}

export async function GET(request: NextRequest) {
  console.log("Admin students API: GET request received");
  try {
    const token = request.cookies.get("adminToken")?.value;
    console.log(
      "Admin students API: Token from cookie:",
      token ? "Present" : "Not present"
    );

    if (!token) {
      console.log("Admin students API: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const { isValid, payload } = verifyJWT(token);
    if (!isValid || !payload || payload.role !== "admin") {
      console.log("Admin students API: Invalid token or not an admin");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Admin students API: Token verified successfully");

    await connectToDatabase();
    console.log("Admin students API: Connected to database");

    const candidates = await Candidate.find({})
      .select(
        "fullName indexNumber gender aggregate residence programme feePaid houseAssigned houseName houseId academicInfo"
      )
      .lean()
      .exec();

    console.log(
      "Admin students API: Candidates found:",
      candidates ? candidates.length : "None"
    );

    // Fetch all classes
    const classes = (await Class.find({}).lean().exec()) as unknown as IClass[];
    const classMap = new Map(classes.map((c) => [c._id.toString(), c.name]));

    const transformedCandidates = candidates.map((candidate) => {
      const className =
        candidate.academicInfo && candidate.academicInfo.selectedClass
          ? classMap.get(candidate.academicInfo.selectedClass.toString()) ||
            "Not Assigned"
          : "Not Assigned";

      return {
        fullName: candidate.fullName,
        indexNumber: candidate.indexNumber,
        gender: candidate.gender,
        aggregate: candidate.aggregate,
        residence: candidate.residence,
        programme: candidate.programme,
        feePaid: candidate.feePaid,
        houseAssigned:
          candidate.houseAssigned ||
          candidate.houseName ||
          candidate.house ||
          "Not Assigned",
        houseName: candidate.houseName,
        houseId: candidate.houseId,
        className: className,
      };
    });

    console.log("Admin students API: Sending transformed candidate data");
    return NextResponse.json(transformedCandidates);
  } catch (error) {
    console.error("Admin students API: Error fetching candidate data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
