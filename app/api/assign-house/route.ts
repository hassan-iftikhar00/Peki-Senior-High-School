import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import House from "@/models/House";
import Candidate from "@/models/Candidate";
import mongoose from "mongoose";

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

    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if the candidate already has a house assigned
      const existingCandidate = await Candidate.findOne({
        indexNumber,
      }).session(session);

      if (existingCandidate && existingCandidate.house) {
        console.log("Candidate already has a house assigned");
        await session.abortTransaction();
        session.endSession();

        const house = await House.findById(existingCandidate.house);
        return NextResponse.json({
          houseId: existingCandidate.house.toString(),
          houseName: house ? house.name : "Unknown",
        });
      }

      // Convert gender to lowercase for case-insensitive comparison
      const normalizedGender = gender.toLowerCase();

      // Find all houses for the given gender
      const houses = await House.find({
        gender: { $regex: new RegExp(`^${normalizedGender}$`, "i") },
      })
        .sort({ currentOccupancy: 1 })
        .session(session);

      if (houses.length === 0) {
        console.log("No houses found for the given gender");
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { error: "No houses found for the given gender" },
          { status: 404 }
        );
      }

      // Find the house with the lowest occupancy
      const availableHouse = houses[0];

      if (availableHouse.currentOccupancy >= availableHouse.capacity) {
        console.log("All houses are at full capacity");
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { error: "All houses are at full capacity" },
          { status: 404 }
        );
      }

      // Assign the house to the student
      const updateResult = await House.findByIdAndUpdate(
        availableHouse._id,
        { $inc: { currentOccupancy: 1 } },
        { new: true, session }
      );

      // Update the candidate's house information
      const updatedCandidate = await Candidate.findOneAndUpdate(
        { indexNumber, house: { $exists: false } },
        {
          $set: {
            house: availableHouse._id,
            houseId: availableHouse._id.toString(),
            houseName: availableHouse.name,
            gender: normalizedGender,
          },
        },
        { new: true, upsert: false, session }
      );

      if (!updatedCandidate) {
        throw new Error("Failed to update candidate with house assignment");
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      console.log(
        "Updated candidate house assignment:",
        JSON.stringify(updatedCandidate, null, 2)
      );

      return NextResponse.json({
        houseId: availableHouse._id.toString(),
        houseName: availableHouse.name,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error assigning house:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
