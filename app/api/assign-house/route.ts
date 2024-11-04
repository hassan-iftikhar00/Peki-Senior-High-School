import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import House from "@/models/House";
import Candidate from "@/models/Candidate";

export async function POST(req: NextRequest) {
  try {
    const { gender, indexNumber } = await req.json();
    console.log("Assigning house for:", { gender, indexNumber });

    if (!gender || !indexNumber) {
      return NextResponse.json(
        { error: "Gender and index number are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log("Connected to database");

    // Convert gender to lowercase for case-insensitive comparison
    const normalizedGender = gender.toLowerCase();

    // Find all houses for the given gender
    const houses = await House.find({
      gender: { $regex: new RegExp(`^${normalizedGender}$`, "i") },
    }).sort({ currentOccupancy: 1 }); // Sort houses by current occupancy

    console.log("All houses for gender:", JSON.stringify(houses, null, 2));

    if (houses.length === 0) {
      console.log("No houses found for the given gender");
      return NextResponse.json(
        { error: "No houses found for the given gender" },
        { status: 404 }
      );
    }

    // Find the house with the lowest occupancy
    const availableHouse = houses[0];

    if (!availableHouse) {
      console.log("All houses are at full capacity");
      return NextResponse.json(
        { error: "All houses are at full capacity" },
        { status: 404 }
      );
    }

    console.log(
      "Found available house:",
      JSON.stringify(availableHouse, null, 2)
    );

    // Assign the house to the student
    const updateResult = await House.findByIdAndUpdate(
      availableHouse._id,
      { $inc: { currentOccupancy: 1 } },
      { new: true }
    );
    console.log(
      "Updated house occupancy result:",
      JSON.stringify(updateResult, null, 2)
    );

    // Update the candidate's house information
    const updatedCandidate = await Candidate.findOneAndUpdate(
      { indexNumber },
      {
        $set: {
          house: availableHouse._id,
          houseId: availableHouse._id.toString(),
          houseName: availableHouse.name,
          gender: normalizedGender,
        },
      },
      { new: true, upsert: true }
    );

    if (!updatedCandidate) {
      throw new Error("Failed to update candidate with house assignment");
    }

    console.log(
      "Updated candidate house assignment:",
      JSON.stringify(updatedCandidate, null, 2)
    );

    return NextResponse.json({
      houseId: availableHouse._id.toString(),
      houseName: availableHouse.name,
    });
  } catch (error) {
    console.error("Error assigning house:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
