import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Programme from "@/models/Programme";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const programmes = await Programme.find({});
    return NextResponse.json(programmes);
  } catch (error) {
    console.error("Error fetching programmes:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching programmes" },
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

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Programme name is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingProgramme = await Programme.findOne({ name });
    if (existingProgramme) {
      return NextResponse.json(
        { error: "A programme with this name already exists" },
        { status: 400 }
      );
    }

    const newProgramme = new Programme({ name });
    await newProgramme.save();

    return NextResponse.json(newProgramme, { status: 201 });
  } catch (error) {
    console.error("Error creating programme:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the programme" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, name } = await request.json();

    if (!_id || !name) {
      return NextResponse.json(
        { error: "Programme ID and name are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedProgramme = await Programme.findByIdAndUpdate(
      _id,
      { name },
      { new: true }
    );

    if (!updatedProgramme) {
      return NextResponse.json(
        { error: "Programme not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProgramme);
  } catch (error) {
    console.error("Error updating programme:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the programme" },
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

    const { _id } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: "Programme ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedProgramme = await Programme.findByIdAndDelete(_id);

    if (!deletedProgramme) {
      return NextResponse.json(
        { error: "Programme not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Programme deleted successfully" });
  } catch (error) {
    console.error("Error deleting programme:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the programme" },
      { status: 500 }
    );
  }
}
