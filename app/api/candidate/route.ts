import { NextResponse } from "next/server";
import Candidate from "@/models/Candidate";
import House from "@/models/House";
import Class from "@/models/Class";
import { connectToDatabase } from "@/lib/db";
import { assignHouse } from "@/app/utils/houseAssignment";
import mongoose from "mongoose";

interface FileData {
  name: string;
  url: string;
  _id?: string;
  [key: string]: any;
}

const formatFileData = (file: string | FileData): FileData => {
  if (typeof file === "string") {
    const fileName = file.split("/").pop() || "file";
    return { name: fileName, url: file };
  }
  const { _id, ...fileData } = file;
  return fileData;
};

// async function generateUniqueApplicationNumber(): Promise<string> {
//   const date = new Date();
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = String(date.getFullYear()).slice(-2);

//   const highestToday = await Candidate.findOne(
//     {
//       applicationNumber: new RegExp(`^${day}${month}${year}-`),
//     },
//     "applicationNumber"
//   )
//     .sort({ applicationNumber: -1 })
//     .lean();

//   let nextNumber = 1;
//   if (highestToday && highestToday.applicationNumber) {
//     const lastNumber = parseInt(highestToday.applicationNumber.split("-")[1]);
//     nextNumber = lastNumber + 1;
//   }

//   return `${day}${month}${year}-${String(nextNumber).padStart(4, "0")}`;
// }

async function generateUniqueApplicationNumber(): Promise<string> {
  const date = new Date();
  const prefix = `${date.getDate().toString().padStart(2, "0")}${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${date.getFullYear().toString().slice(-2)}-`;

  const lastCandidate = await Candidate.findOne(
    { applicationNumber: new RegExp(`^${prefix}`) },
    { applicationNumber: 1 },
    { sort: { applicationNumber: -1 } }
  );

  let lastNumber = 0;
  if (lastCandidate && lastCandidate.applicationNumber) {
    const parts = lastCandidate.applicationNumber.split("-");
    if (parts.length > 1) {
      lastNumber = parseInt(parts[1], 10) || 0;
    }
  }

  return `${prefix}${(lastNumber + 1).toString().padStart(4, "0")}`;
}

export async function POST(request: Request) {
  let session: mongoose.ClientSession | undefined;
  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const candidateData = await request.json();
    console.log(
      "Received candidate data:",
      JSON.stringify(candidateData, null, 2)
    );

    // Format uploads
    const formattedUploads = {
      placementForm: candidateData.uploads.placementForm
        .filter(Boolean)
        .map(formatFileData),
      nhisCard: candidateData.uploads.nhisCard
        ? formatFileData(candidateData.uploads.nhisCard)
        : null,
      idDocument: candidateData.uploads.idDocument
        ? formatFileData(candidateData.uploads.idDocument)
        : null,
      medicalRecords: (candidateData.uploads.medicalRecords || [])
        .filter(Boolean)
        .map(formatFileData),
    };

    // Normalize gender to lowercase
    const normalizedGender = candidateData.gender.toLowerCase();
    console.log("Normalized gender:", normalizedGender);

    const existingCandidate = await Candidate.findOne({
      indexNumber: candidateData.indexNumber,
    }).session(session);

    console.log("Existing candidate:", existingCandidate);

    let houseId =
      candidateData.houseId || (existingCandidate && existingCandidate.house);
    console.log("Initial houseId:", houseId);

    if (!houseId) {
      console.log("No house assigned, attempting to assign a new house...");
      houseId = await assignHouse(normalizedGender);
      console.log("Assigned houseId:", houseId);

      if (!houseId) {
        await session.abortTransaction();
        console.log("No available houses for gender:", normalizedGender);

        // Log the current state of all houses
        const allHouses = await House.find({});
        console.log("All houses:", JSON.stringify(allHouses, null, 2));

        return NextResponse.json(
          { error: "No available houses. Please contact the administrator." },
          { status: 400 }
        );
      }
    } else {
      console.log("Keeping existing house assignment:", houseId);
    }

    // Verify the assigned house
    const house = await House.findById(houseId).session(session);
    console.log("Found house:", house);

    if (!house) {
      await session.abortTransaction();
      console.log("Assigned house not found:", houseId);
      return NextResponse.json(
        {
          error: "Assigned house not found. Please contact the administrator.",
        },
        { status: 400 }
      );
    }

    if (house.currentOccupancy >= house.capacity) {
      await session.abortTransaction();
      console.log("Assigned house is full:", houseId);
      return NextResponse.json(
        { error: "Assigned house is full. Please contact the administrator." },
        { status: 400 }
      );
    }

    // Update the house occupancy if it's a new assignment
    if (!existingCandidate || !existingCandidate.house) {
      await House.findByIdAndUpdate(houseId, {
        $inc: { currentOccupancy: 1 },
      }).session(session);
      console.log("Updated house occupancy for new assignment");
    }
    // Handle class assignment and occupancy
    let classId = candidateData.academicInfo.selectedClass;
    console.log("Selected class ID:", classId);

    if (classId && classId !== "Not Specified") {
      const selectedClass = await Class.findById(classId).session(session);
      if (!selectedClass) {
        await session.abortTransaction();
        console.log("Selected class not found:", classId);
        return NextResponse.json(
          { error: "Selected class not found. Please try again." },
          { status: 400 }
        );
      }

      console.log("Selected class:", selectedClass);

      if (selectedClass.occupancy >= selectedClass.capacity) {
        await session.abortTransaction();
        console.log("Selected class is full:", classId);
        return NextResponse.json(
          { error: "Selected class is full. Please choose another class." },
          { status: 400 }
        );
      }

      // If the candidate is changing classes, update occupancies
      if (existingCandidate && existingCandidate.academicInfo) {
        const existingClassId = existingCandidate.academicInfo.selectedClass;
        console.log("Existing class ID:", existingClassId);

        if (existingClassId) {
          const existingClassIdString = existingClassId.toString();
          if (
            existingClassIdString !== classId &&
            existingClassIdString !== "Not Specified"
          ) {
            await Class.findByIdAndUpdate(existingClassId, {
              $inc: { occupancy: -1 },
            }).session(session);
            await Class.findByIdAndUpdate(classId, {
              $inc: { occupancy: 1 },
            }).session(session);
          }
        }
      } else if (!existingCandidate) {
        // If it's a new candidate, increase the occupancy of the selected class
        await Class.findByIdAndUpdate(classId, {
          $inc: { occupancy: 1 },
        }).session(session);
      }
    }

    // Generate or validate application number
    let applicationNumber = candidateData.applicationNumber;
    if (!applicationNumber || !/^\d{6}-\d{4}$/.test(applicationNumber)) {
      applicationNumber = await generateUniqueApplicationNumber();
    }

    // Prepare formatted data
    const formattedData = {
      ...candidateData,
      gender: normalizedGender,
      uploads: formattedUploads,
      house: houseId,
      houseAssigned: house.name,
      academicInfo: {
        ...candidateData.academicInfo,
        selectedClass: classId,
      },
      applicationNumber,
    };

    console.log("Formatted data:", JSON.stringify(formattedData, null, 2));

    let updatedCandidate;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        if (existingCandidate) {
          // Update existing candidate
          updatedCandidate = await Candidate.findOneAndUpdate(
            { indexNumber: candidateData.indexNumber },
            formattedData,
            { new: true, runValidators: true, session }
          );
        } else {
          // Create new candidate
          updatedCandidate = new Candidate(formattedData);
          await updatedCandidate.save({ session });

          // Increase occupancy of the assigned house only for new candidates
          await House.findByIdAndUpdate(houseId, {
            $inc: { currentOccupancy: 1 },
          }).session(session);
        }
        break; // If successful, exit the loop
      } catch (error) {
        if (
          error instanceof mongoose.Error.ValidationError &&
          error.errors.applicationNumber
        ) {
          // If duplicate key error on applicationNumber, generate a new one
          attempts++;
          applicationNumber = await generateUniqueApplicationNumber();
          formattedData.applicationNumber = applicationNumber;
        } else {
          throw error; // If it's a different error, throw it
        }
      }
    }

    if (!updatedCandidate) {
      await session.abortTransaction();
      console.log("Failed to create or update candidate");
      return NextResponse.json(
        { error: "Failed to create or update candidate. Please try again." },
        { status: 500 }
      );
    }

    await session.commitTransaction();
    console.log("Transaction committed successfully");

    return NextResponse.json({
      message: existingCandidate
        ? "Candidate Data Updated Successfully!"
        : "Candidate Data Saved Successfully!",
      candidate: updatedCandidate,
      applicationNumber: updatedCandidate.applicationNumber,
    });
  } catch (error) {
    console.error("Error saving/updating candidate data:", error);
    if (session) {
      await session.abortTransaction();
      console.log("Transaction aborted");
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to save/update candidate data.", details: errorMessage },
      { status: 500 }
    );
  } finally {
    if (session) {
      session.endSession();
      console.log("Session ended");
    }
  }
}
