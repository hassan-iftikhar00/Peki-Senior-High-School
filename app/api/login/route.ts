import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { compare } from "bcrypt";
import { connectToDatabase } from "@/lib/db";
import Candidate, { ICandidateDocument } from "@/models/Candidate";
import CandidateLog from "@/models/CandidateLog";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const JWT_SECRET = serverRuntimeConfig.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export async function POST(request: NextRequest) {
  try {
    const { serial, pin } = await request.json();

    console.log("Received login attempt:");
    console.log("Serial:", serial);

    await connectToDatabase();
    console.log("Connected to MongoDB");

    const candidate = (await Candidate.findOne({
      serialNumber: serial,
    }).exec()) as ICandidateDocument | null;

    if (!candidate) {
      console.log("No candidate found for the provided credentials");
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Candidate found:", candidate.fullName);

    if (!candidate.pin) {
      console.log("Candidate has no PIN set");
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPin = await compare(pin, candidate.pin);

    console.log("PIN comparison result:", isValidPin);

    if (!isValidPin) {
      console.log("Invalid PIN provided");
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = sign({ indexNumber: candidate.indexNumber }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Create a log entry for the successful login
    await CandidateLog.create({
      name: candidate.fullName,
      timeIn: new Date(),
      activityDetails: "Candidate logged in",
      timeOut: new Date(),
    });

    console.log("Candidate login log created");

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token: token, // Send the token in the response body
    });

    // Set the token as an HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
      path: "/",
    });

    console.log("Login successful, token set in cookie and response body");

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
