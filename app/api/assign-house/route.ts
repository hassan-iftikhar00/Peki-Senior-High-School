import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

const HouseSchema = new mongoose.Schema({
  gender: String,
  currentOccupancy: {
    type: Number,
    default: 0,
  },
  capacity: {
    type: Number,
    required: true,
  },
  name: String,
});

const CandidateSchema = new mongoose.Schema({
  indexNumber: {
    type: String,
    required: true,
    unique: true,
  },
  gender: String,
  houseId: String,
  houseName: String,
});

const House = mongoose.models.House || mongoose.model("House", HouseSchema);
const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);

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

    // Find all houses for the given gender
    const houses = await House.find({
      gender: { $regex: new RegExp(gender, "i") },
    });
    console.log("All houses for gender:", JSON.stringify(houses, null, 2));

    if (houses.length === 0) {
      console.log("No houses found for the given gender");
      return NextResponse.json(
        { error: "No houses found for the given gender" },
        { status: 404 }
      );
    }

    // Log each house's occupancy status
    houses.forEach((house) => {
      console.log(
        `House: ${house.name}, Current Occupancy: ${
          house.currentOccupancy
        }, Capacity: ${house.capacity}, Available: ${
          house.currentOccupancy < house.capacity
        }`
      );
    });

    // Find an available house
    const availableHouse = houses.find((house) => {
      const isAvailable = house.currentOccupancy < house.capacity;
      console.log(`Checking house: ${house.name}, isAvailable: ${isAvailable}`);
      return isAvailable;
    });

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
    const updateResult = await House.updateOne(
      { _id: availableHouse._id },
      { $inc: { currentOccupancy: 1 } }
    );
    console.log("Updated house occupancy result:", updateResult);

    // Update the candidate's houseId and houseName
    const updatedCandidate = await Candidate.findOneAndUpdate(
      { indexNumber },
      {
        $set: {
          houseId: availableHouse._id.toString(),
          houseName: availableHouse.name,
          gender: gender,
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
    return NextResponse.json({ status: 500 });
  }
}
