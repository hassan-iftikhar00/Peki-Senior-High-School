// app/api/verify/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

// Create a schema and model for students
const studentSchema = new mongoose.Schema({
  indexNumber: { type: String, required: true, unique: true },
  // Add any additional fields you need
});

const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export async function POST(request) {
  const { indexNumber } = await request.json();

  try {
    await connectToDatabase();

    const student = await Student.findOne({ indexNumber });

    if (student) {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
