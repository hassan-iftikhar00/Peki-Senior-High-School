import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { verifyToken } from "@/lib/auth";
import House from "@/models/House";

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedData = await request.json();
    const {
      oldIndexNumber,
      indexNumber,
      feePaid,
      gender,
      houseId,
      ...otherStudentData
    } = updatedData;

    if (!oldIndexNumber || !indexNumber || feePaid === undefined || !gender) {
      return NextResponse.json(
        {
          error:
            "Index number, new index number, fee paid status, and gender are required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingStudent = await Candidate.findOne({
      indexNumber: oldIndexNumber,
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let newHouseName;
    if (houseId !== existingStudent.houseId) {
      if (existingStudent.houseId) {
        await House.findByIdAndUpdate(existingStudent.houseId, {
          $inc: { currentOccupancy: -1 },
        });
      }
      if (houseId) {
        const newHouse = await House.findByIdAndUpdate(
          houseId,
          { $inc: { currentOccupancy: 1 } },
          { new: true }
        );
        if (!newHouse) {
          return NextResponse.json(
            { error: "Invalid house ID" },
            { status: 400 }
          );
        }
        newHouseName = newHouse.name;
      }
    }

    const updatedStudent = await Candidate.findOneAndUpdate(
      { indexNumber: oldIndexNumber },
      {
        $set: {
          indexNumber,
          feePaid,
          gender,
          houseId,
          houseName: newHouseName || existingStudent.houseName,
          houseAssigned: newHouseName || existingStudent.houseName,
          ...otherStudentData,
        },
      },
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { error: "Failed to update student" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { indexNumber } = await request.json();

    if (!indexNumber) {
      return NextResponse.json(
        { error: "Index number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedStudent = await Candidate.findOneAndDelete({
      indexNumber: indexNumber,
    });

    if (!deletedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the student" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentData = await request.json();
    const { indexNumber, gender, feePaid, ...otherStudentData } = studentData;

    if (!indexNumber || !gender || feePaid === undefined) {
      return NextResponse.json(
        {
          error: "Index number, gender, and fee paid status are required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingStudent = await Candidate.findOne({ indexNumber });
    if (existingStudent) {
      return NextResponse.json(
        { error: "A student with this index number already exists" },
        { status: 400 }
      );
    }

    const newStudent = new Candidate({
      indexNumber,
      gender,
      feePaid,
      ...otherStudentData,
    });
    await newStudent.save();

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the student" },
      { status: 500 }
    );
  }
}
