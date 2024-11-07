import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { verifyToken } from "@/lib/auth";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileContent = await file.text();
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    await connectToDatabase();

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const requiredHeaders = ["fullName", "indexNumber", "gender", "feePaid"];
    const headers = Object.keys(records[0]);
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required headers: ${missingHeaders.join(", ")}`,
        },
        { status: 400 }
      );
    }

    for (const [index, record] of records.entries()) {
      try {
        // Validate required fields
        if (
          !record.fullName ||
          !record.indexNumber ||
          !record.gender ||
          record.feePaid === undefined
        ) {
          throw new Error(
            `Row ${index + 2}: Missing required fields for student ${
              record.indexNumber || "unknown"
            }`
          );
        }

        // Validate gender
        if (
          record.gender.toLowerCase() !== "male" &&
          record.gender.toLowerCase() !== "female"
        ) {
          throw new Error(
            `Row ${index + 2}: Invalid gender for student ${
              record.indexNumber
            }. Must be 'male' or 'female'`
          );
        }

        // Validate feePaid
        if (
          record.feePaid.toLowerCase() !== "true" &&
          record.feePaid.toLowerCase() !== "false"
        ) {
          throw new Error(
            `Row ${index + 2}: Invalid feePaid value for student ${
              record.indexNumber
            }. Must be 'true' or 'false'`
          );
        }

        // Convert feePaid to boolean
        record.feePaid = record.feePaid.toLowerCase() === "true";

        // Check if student already exists
        const existingStudent = await Candidate.findOne({
          indexNumber: record.indexNumber,
        });
        if (existingStudent) {
          throw new Error(
            `Row ${index + 2}: Student with index number ${
              record.indexNumber
            } already exists`
          );
        }

        // Create new student
        const newStudent = new Candidate(record);
        await newStudent.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push((error as Error).message);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error processing bulk upload:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the bulk upload" },
      { status: 500 }
    );
  }
}
