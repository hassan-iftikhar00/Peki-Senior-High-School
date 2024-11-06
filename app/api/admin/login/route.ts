import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { compare } from "bcrypt";
import { connectToDatabase } from "@/lib/db";
import Admin, { IAdminDocument } from "@/models/Admin";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const JWT_SECRET = serverRuntimeConfig.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("Received admin login attempt:");
    console.log("Email:", email);

    await connectToDatabase();
    console.log("Connected to MongoDB");

    const admin = (await Admin.findOne({
      email,
    }).exec()) as IAdminDocument | null;

    if (!admin) {
      console.log("No admin found for the provided credentials");
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Admin found:", admin.name);

    if (!admin.password) {
      console.log("Admin has no password set");
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, admin.password);

    console.log("Password comparison result:", isValidPassword);

    if (!isValidPassword) {
      console.log("Invalid password provided");
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = sign({ adminId: admin._id, role: "admin" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      token: token, // Send the token in the response body
    });

    // Set the token as an HTTP-only cookie
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
      path: "/",
    });

    console.log(
      "Admin login successful, token set in cookie and response body"
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
