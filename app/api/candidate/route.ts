// import { NextResponse } from "next/server";
// import Candidate from "@/models/Candidate";
// import House from "@/models/House";
// import { connectToDatabase } from "@/lib/db";
// import { assignHouse } from "@/app/utils/houseAssignment";
// import mongoose from "mongoose";

// // Helper function to format file data consistently
// const formatFileData = (
//   file: string | { name: string; url: string; _id?: string }
// ) => {
//   if (typeof file === "string") {
//     // Extract filename from URL
//     const fileName = file.split("/").pop() || "file";
//     return {
//       name: fileName,
//       url: file,
//     };
//   }
//   // If it's already an object, return without _id
//   const { _id, ...fileData } = file;
//   return fileData;
// };

// export async function POST(request: Request) {
//   let session;
//   try {
//     await connectToDatabase();
//     session = await mongoose.startSession();
//     session.startTransaction();

//     const candidateData = await request.json();
//     console.log(
//       "Received candidate data:",
//       JSON.stringify(candidateData, null, 2)
//     );

//     // Format the uploads data to match the schema
//     const formattedUploads = {
//       placementForm: candidateData.uploads.placementForm
//         .filter(Boolean)
//         .map(formatFileData),
//       nhisCard: candidateData.uploads.nhisCard
//         ? formatFileData(candidateData.uploads.nhisCard)
//         : null,
//       idDocument: candidateData.uploads.idDocument
//         ? formatFileData(candidateData.uploads.idDocument)
//         : null,
//       medicalRecords: (candidateData.uploads.medicalRecords || [])
//         .filter(Boolean)
//         .map(formatFileData),
//     };

//     // Check if a house is already assigned
//     let houseId = candidateData.houseId;
//     if (!houseId) {
//       // Assign house based on gender
//       houseId = await assignHouse(candidateData.gender);
//       if (!houseId) {
//         await session.abortTransaction();
//         console.log("No available houses for gender:", candidateData.gender);
//         return NextResponse.json(
//           { error: "No available houses" },
//           { status: 400 }
//         );
//       }
//     }

//     // Verify the assigned house
//     const house = await House.findById(houseId).session(session);
//     if (!house) {
//       await session.abortTransaction();
//       console.log("Assigned house not found:", houseId);
//       return NextResponse.json(
//         { error: "Assigned house not found" },
//         { status: 400 }
//       );
//     }

//     if (house.currentOccupancy >= house.capacity) {
//       await session.abortTransaction();
//       console.log("Assigned house is full:", houseId);
//       return NextResponse.json(
//         { error: "Assigned house is full" },
//         { status: 400 }
//       );
//     }

//     const formattedData = {
//       ...candidateData,
//       uploads: formattedUploads,
//       house: houseId,
//     };

//     // Try to find an existing document with the same indexNumber
//     const existingCandidate = await Candidate.findOne({
//       indexNumber: candidateData.indexNumber,
//     }).session(session);

//     let updatedCandidate;
//     if (existingCandidate) {
//       // If gender is being updated, reassign house
//       if (existingCandidate.gender !== candidateData.gender) {
//         const newHouseId = await assignHouse(candidateData.gender);

//         if (!newHouseId) {
//           await session.abortTransaction();
//           console.log(
//             "No available houses for new gender:",
//             candidateData.gender
//           );
//           return NextResponse.json(
//             { error: "No available houses for new gender" },
//             { status: 400 }
//           );
//         }

//         // Decrease occupancy of old house
//         if (existingCandidate.house) {
//           await House.findByIdAndUpdate(existingCandidate.house, {
//             $inc: { currentOccupancy: -1 },
//           }).session(session);
//         }

//         formattedData.house = newHouseId;
//       }

//       updatedCandidate = await Candidate.findOneAndUpdate(
//         { indexNumber: candidateData.indexNumber },
//         formattedData,
//         {
//           new: true,
//           runValidators: true,
//           session,
//         }
//       );
//     } else {
//       updatedCandidate = new Candidate(formattedData);
//       await updatedCandidate.save({ session });
//     }

//     // Increase occupancy of the assigned house
//     await House.findByIdAndUpdate(formattedData.house, {
//       $inc: { currentOccupancy: 1 },
//     }).session(session);

//     await session.commitTransaction();
//     console.log("Transaction committed successfully");

//     return NextResponse.json({
//       message: existingCandidate
//         ? "Candidate Data Updated Successfully!"
//         : "Candidate Data Saved Successfully!",
//       candidate: updatedCandidate,
//       applicationNumber: candidateData.applicationNumber,
//     });
//   } catch (error: unknown) {
//     console.error("Error saving/updating candidate data:", error);
//     if (session) {
//       await session.abortTransaction();
//       console.log("Transaction aborted");
//     }
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     return NextResponse.json(
//       { error: "Failed to save/update candidate data.", details: errorMessage },
//       { status: 500 }
//     );
//   } finally {
//     if (session) {
//       session.endSession();
//       console.log("Session ended");
//     }
//   }
// }

// export async function PUT(request: Request) {
//   await connectToDatabase();

//   try {
//     const candidateData = await request.json();
//     console.log(
//       "Received candidate update data:",
//       JSON.stringify(candidateData, null, 2)
//     );

//     const existingCandidate = await Candidate.findOne({
//       indexNumber: candidateData.indexNumber,
//     });

//     if (!existingCandidate) {
//       return NextResponse.json(
//         { error: "Candidate not found" },
//         { status: 404 }
//       );
//     }

//     // Format the uploads data to match the schema
//     const formattedUploads = {
//       placementForm: candidateData.uploads.placementForm
//         .filter(Boolean)
//         .map(formatFileData),
//       nhisCard: candidateData.uploads.nhisCard
//         ? formatFileData(candidateData.uploads.nhisCard)
//         : null,
//       idDocument: candidateData.uploads.idDocument
//         ? formatFileData(candidateData.uploads.idDocument)
//         : null,
//       medicalRecords: (candidateData.uploads.medicalRecords || [])
//         .filter(Boolean)
//         .map(formatFileData),
//     };

//     // If gender is being updated, reassign house
//     if (
//       candidateData.gender &&
//       candidateData.gender !== existingCandidate.gender
//     ) {
//       const newHouseId = await assignHouse(candidateData.gender);

//       if (!newHouseId) {
//         return NextResponse.json(
//           { error: "No available houses for new gender" },
//           { status: 400 }
//         );
//       }

//       // Decrease occupancy of old house
//       if (existingCandidate.house) {
//         await House.findByIdAndUpdate(existingCandidate.house, {
//           $inc: { currentOccupancy: -1 },
//         });
//       }

//       candidateData.house = newHouseId;
//     } else {
//       candidateData.house = existingCandidate.house;
//     }

//     const formattedData = {
//       ...candidateData,
//       uploads: formattedUploads,
//     };

//     const updatedCandidate = await Candidate.findOneAndUpdate(
//       { indexNumber: candidateData.indexNumber },
//       formattedData,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     return NextResponse.json({
//       message: "Candidate Data Updated Successfully!",
//       candidate: updatedCandidate,
//       applicationNumber: candidateData.applicationNumber,
//     });
//   } catch (error: unknown) {
//     console.error("Error updating candidate data:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     return NextResponse.json(
//       { error: "Failed to update candidate data.", details: errorMessage },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import Candidate from "@/models/Candidate";
import House from "@/models/House";
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

async function generateUniqueApplicationNumber(): Promise<string> {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  const highestToday = await Candidate.findOne(
    {
      applicationNumber: new RegExp(`^${day}${month}${year}-`),
    },
    "applicationNumber"
  )
    .sort({ applicationNumber: -1 })
    .lean();

  let nextNumber = 1;
  if (highestToday && highestToday.applicationNumber) {
    const lastNumber = parseInt(highestToday.applicationNumber.split("-")[1]);
    nextNumber = lastNumber + 1;
  }

  return `${day}${month}${year}-${String(nextNumber).padStart(4, "0")}`;
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

    // Find existing candidate
    const existingCandidate = await Candidate.findOne({
      indexNumber: candidateData.indexNumber,
    }).session(session);

    let houseId =
      candidateData.houseId || (existingCandidate && existingCandidate.house);

    // If no house is assigned, or if gender has changed, assign a new house
    if (
      !houseId ||
      (existingCandidate && existingCandidate.gender !== normalizedGender)
    ) {
      if (existingCandidate && existingCandidate.house) {
        // Decrease occupancy of old house
        await House.findByIdAndUpdate(existingCandidate.house, {
          $inc: { currentOccupancy: -1 },
        }).session(session);
      }

      houseId = await assignHouse(normalizedGender);
      if (!houseId) {
        await session.abortTransaction();
        console.log("No available houses for gender:", normalizedGender);
        return NextResponse.json(
          { error: "No available houses. Please contact the administrator." },
          { status: 400 }
        );
      }
    }

    // Verify the assigned house
    const house = await House.findById(houseId).session(session);
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
        selectedClass:
          candidateData.academicInfo.selectedClass || "Not Specified",
      },
      applicationNumber,
    };

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
