import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import House from "@/models/House";
import jwt from "jsonwebtoken";
import { SortOrder } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET!;

function verifyToken(token: string | undefined): {
  isValid: boolean;
  payload: any;
} {
  if (!token) {
    return { isValid: false, payload: null };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { isValid: true, payload: decoded };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { isValid: false, payload: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    const { isValid, payload } = verifyToken(token);

    if (!isValid || !payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sort = url.searchParams.get("sort") || "gender";
    const direction = url.searchParams.get("direction") || "asc";
    const gender = url.searchParams.get("gender") || "All";

    const skip = (page - 1) * limit;

    let query = {};
    if (gender !== "All") {
      query = { gender: new RegExp(`^${gender}$`, "i") };
    }

    let sortOptions: { [key: string]: SortOrder } = {};

    if (sort === "gender") {
      sortOptions = {
        gender: direction as SortOrder,
        name: "asc" as SortOrder,
      };
    } else {
      sortOptions = {
        gender: "asc" as SortOrder,
        [sort]: direction as SortOrder,
      };
    }

    const houses = await House.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await House.countDocuments(query);

    return NextResponse.json({
      houses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalHouses: total,
    });
  } catch (error) {
    console.error("Error fetching houses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    const { isValid, payload } = verifyToken(token);

    if (!isValid || !payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const houseData = await request.json();
    const house = await House.create(houseData);
    return NextResponse.json(house, { status: 201 });
  } catch (error) {
    console.error("Error creating house:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    const { isValid, payload } = verifyToken(token);

    if (!isValid || !payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedData = await request.json();
    const { _id, name, gender, capacity } = updatedData;

    // Check for required fields
    if (!_id || !name || !gender || capacity === undefined) {
      return NextResponse.json(
        {
          error: "House ID, name, gender, and capacity are required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the house by ID and update
    const existingHouse = await House.findById(_id);

    if (!existingHouse) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    // Update the house data
    existingHouse.name = name;
    existingHouse.gender = gender;
    existingHouse.capacity = capacity;

    // Save the updated house
    const updatedHouse = await existingHouse.save();

    return NextResponse.json(updatedHouse);
  } catch (error) {
    console.error("Error updating house:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the house" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    const { isValid, payload } = verifyToken(token);

    if (!isValid || !payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: "House ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deletedHouse = await House.findByIdAndDelete(_id);

    if (!deletedHouse) {
      return NextResponse.json({ error: "House not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "House deleted successfully" });
  } catch (error) {
    console.error("Error deleting house:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the house" },
      { status: 500 }
    );
  }
}
