import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { verify, JwtPayload } from "jsonwebtoken";

import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const JWT_SECRET = serverRuntimeConfig.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

interface DecodedToken extends JwtPayload {
  indexNumber?: string;
}

export async function GET(request: NextRequest) {
  console.log("Applicant data API: GET request received");
  try {
    const token = request.cookies.get("token")?.value;
    console.log(
      "Applicant data API: Token from cookie:",
      token ? "Present" : "Not present"
    );

    if (!token) {
      console.log("Applicant data API: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    let decoded: DecodedToken;
    try {
      decoded = verify(token, JWT_SECRET) as DecodedToken;
      console.log("Applicant data API: Token verified successfully");
    } catch (error) {
      console.error("Applicant data API: Token verification failed:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded.indexNumber) {
      console.log("Applicant data API: Invalid token: missing index number");
      return NextResponse.json(
        { error: "Invalid token: missing index number" },
        { status: 401 }
      );
    }

    const indexNumber = decoded.indexNumber;
    console.log("Applicant data API: Index number from token:", indexNumber);

    await connectToDatabase();
    console.log("Applicant data API: Connected to database");

    const candidate = await Candidate.findOne({ indexNumber });
    console.log(
      "Applicant data API: Candidate found:",
      candidate ? "Yes" : "No"
    );

    if (!candidate) {
      console.log(
        "Applicant data API: Candidate not found for index number:",
        indexNumber
      );
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const applicantData = {
      fullName: candidate.fullName,
      indexNumber: candidate.indexNumber,
      gender: candidate.gender,
      aggregate: candidate.aggregate,
      residence: candidate.residence,
      programme: candidate.programme,
      nhisNo: candidate.nhisNo || "",
      enrollmentCode: candidate.enrollmentCode || "", // Add this line
      houseAssigned: candidate.house?.houseAssigned || "",
      passportPhoto: candidate.passportPhoto || "",
      phoneNumber: candidate.phoneNumber || "",
      guardianInfo: candidate.guardianInfo || {},
      additionalInfo: candidate.additionalInfo || {},
      academicInfo: candidate.academicInfo || {},
      uploads: candidate.uploads || {},
      applicationNumber: candidate.applicationNumber,
      feePaid: candidate.feePaid,
      houseId: candidate.houseId,
    };

    console.log("Applicant data API: Sending applicant data");
    return NextResponse.json(applicantData);
  } catch (error) {
    console.error("Applicant data API: Error fetching applicant data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
