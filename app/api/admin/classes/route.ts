import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Class from "@/models/Class";
import { verifyToken } from "@/lib/auth";
import Programme from "@/models/Programme";

async function seedCoreSubjects() {
  try {
    await connectToDatabase();

    const defaultCoreSubjects = [
      "English Language",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
    ];

    const result = await Class.updateMany(
      { coreSubjects: { $exists: false } },
      { $set: { coreSubjects: defaultCoreSubjects } }
    );

    console.log(
      `Updated ${result.modifiedCount} classes with default core subjects.`
    );
  } catch (error) {
    console.error("Error seeding core subjects:", error);
  }
}

// Call the seed function when the API route is first loaded
seedCoreSubjects();
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const programmeName = searchParams.get("programme");

    console.log("Fetching classes for programme:", programmeName);

    let query = {};
    if (programmeName) {
      const programme = await Programme.findOne({ name: programmeName });
      if (!programme) {
        console.log("Programme not found:", programmeName);
        return NextResponse.json(
          { error: "Programme not found" },
          { status: 404 }
        );
      }
      query = { programme: programme._id };
    }

    const classes = await Class.find(query).populate("programme");
    console.log("Raw classes data:", JSON.stringify(classes, null, 2));

    // Validate and sanitize class data
    const sanitizedClasses = classes.map((cls) => {
      const sanitized = {
        _id: cls._id,
        name: cls.name,
        programme: cls.programme,
        capacity: Number(cls.capacity) || 0,
        occupancy: Number(cls.occupancy) || 0,
        coreSubjects: cls.coreSubjects || [],
        electiveSubjects: cls.electiveSubjects || [],
      };
      console.log("Sanitized class:", JSON.stringify(sanitized, null, 2));
      return sanitized;
    });

    console.log(
      "Sending sanitized classes:",
      JSON.stringify(sanitizedClasses, null, 2)
    );

    return NextResponse.json(sanitizedClasses);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching classes" },
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

    await connectToDatabase();

    const {
      name,
      programme,
      capacity,
      occupancy,
      coreSubjects,
      electiveSubjects,
    } = await request.json();

    const newClass = new Class({
      name,
      programme,
      capacity,
      occupancy,
      coreSubjects,
      electiveSubjects,
    });

    await newClass.save();
    console.log("New class created:", JSON.stringify(newClass, null, 2));

    return NextResponse.json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the class" },
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

    await connectToDatabase();

    const {
      _id,
      name,
      programme,
      capacity,
      occupancy,
      coreSubjects,
      electiveSubjects,
    } = await request.json();

    const updatedClass = await Class.findByIdAndUpdate(
      _id,
      { name, programme, capacity, occupancy, coreSubjects, electiveSubjects },
      { new: true, runValidators: true }
    ).populate("programme");

    if (!updatedClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    console.log("Updated class:", JSON.stringify(updatedClass, null, 2));

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the class" },
      { status: 500 }
    );
  }
}
