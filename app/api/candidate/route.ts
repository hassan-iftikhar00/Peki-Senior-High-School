// import { NextResponse } from "next/server";
// import Candidate from "@/models/Candidate";
// import { connectToDatabase } from "@/lib/db";

// export async function POST(request: Request) {
//   await connectToDatabase();

//   try {
//     const candidateData = await request.json();
//     console.log(
//       "Received candidate data:",
//       JSON.stringify(candidateData, null, 2)
//     );

//     // Format the uploads data to match the schema
//     const formattedUploads = {
//       placementForm: candidateData.uploads.placementForm,
//       nhisCard: candidateData.uploads.nhisCard,
//       idDocument: candidateData.uploads.idDocument,
//       medicalRecords: candidateData.uploads.medicalRecords || [],
//     };

//     // Verify application number format
//     const appNumberRegex = /^\d{6}-\d{3}$/; // Format: DDMMYY-XXX
//     if (!appNumberRegex.test(candidateData.applicationNumber)) {
//       return NextResponse.json(
//         { error: "Invalid application number format" },
//         { status: 400 }
//       );
//     }

//     // Check if application number already exists
//     const existingAppNumber = await Candidate.findOne({
//       applicationNumber: candidateData.applicationNumber,
//     });

//     if (existingAppNumber) {
//       return NextResponse.json(
//         { error: "Application number already exists" },
//         { status: 409 }
//       );
//     }

//     const formattedData = {
//       ...candidateData,
//       uploads: formattedUploads,
//     };

//     // Try to find an existing document with the same indexNumber
//     const existingCandidate = await Candidate.findOne({
//       indexNumber: candidateData.indexNumber,
//     });

//     if (existingCandidate) {
//       const updatedCandidate = await Candidate.findOneAndUpdate(
//         { indexNumber: candidateData.indexNumber },
//         formattedData,
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//       return NextResponse.json(
//         {
//           message: "Candidate Data Updated Successfully!",
//           candidate: updatedCandidate,
//           applicationNumber: candidateData.applicationNumber,
//         },
//         { status: 200 }
//       );
//     } else {
//       const newCandidate = new Candidate(formattedData);
//       await newCandidate.save();

//       return NextResponse.json(
//         {
//           message: "Candidate Data Saved Successfully!",
//           candidate: newCandidate,
//           applicationNumber: candidateData.applicationNumber,
//         },
//         { status: 201 }
//       );
//     }
//   } catch (error: unknown) {
//     console.error("Error saving candidate data:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     return NextResponse.json(
//       { error: "Failed to save candidate data.", details: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: Request) {
//   try {
//     await connectToDatabase();

//     const { searchParams } = new URL(request.url);
//     const indexNumber = searchParams.get("indexNumber");

//     if (!indexNumber) {
//       return NextResponse.json(
//         { error: "Index number is required" },
//         { status: 400 }
//       );
//     }

//     const candidate = await Candidate.findOne({ indexNumber });

//     if (!candidate) {
//       return NextResponse.json(
//         { error: "Candidate not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(candidate);
//   } catch (error) {
//     console.error("Error fetching candidate:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch candidate data" },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from "next/server";
// import Candidate from "@/models/Candidate";
// import { connectToDatabase } from "@/lib/db";

// export async function POST(request: Request) {
//   await connectToDatabase();

//   try {
//     const candidateData = await request.json();
//     console.log(
//       "Received candidate data:",
//       JSON.stringify(candidateData, null, 2)
//     );

//     // Check for existing candidate and application number
//     const existingCandidate = await Candidate.findOne({
//       indexNumber: candidateData.indexNumber,
//     });

//     // If candidate exists and has an application number, return it
//     if (existingCandidate?.applicationNumber) {
//       return NextResponse.json({
//         message: "Application number already exists for this candidate",
//         applicationNumber: existingCandidate.applicationNumber,
//         candidate: existingCandidate,
//       });
//     }

//     // Validate application number format if provided
//     if (candidateData.applicationNumber) {
//       const appNumberRegex = /^\d{6}-\d{3}$/;
//       if (!appNumberRegex.test(candidateData.applicationNumber)) {
//         return NextResponse.json(
//           { error: "Invalid application number format" },
//           { status: 400 }
//         );
//       }
//     }

//     // Format the data - uploads are already in correct format
//     const formattedData = {
//       ...candidateData,
//       uploads: {
//         placementForm: candidateData.uploads.placementForm || [],
//         nhisCard: candidateData.uploads.nhisCard || null,
//         idDocument: candidateData.uploads.idDocument || null,
//         medicalRecords: candidateData.uploads.medicalRecords || [],
//       },
//     };

//     if (existingCandidate) {
//       // Update existing candidate
//       const updatedCandidate = await Candidate.findOneAndUpdate(
//         { indexNumber: candidateData.indexNumber },
//         formattedData,
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//       return NextResponse.json({
//         message: "Candidate data updated successfully",
//         candidate: updatedCandidate,
//         applicationNumber: updatedCandidate.applicationNumber,
//       });
//     } else {
//       // Create new candidate
//       const newCandidate = new Candidate(formattedData);
//       await newCandidate.save();

//       return NextResponse.json({
//         message: "Candidate data saved successfully",
//         candidate: newCandidate,
//         applicationNumber: newCandidate.applicationNumber,
//       });
//     }
//   } catch (error: unknown) {
//     console.error("Error saving candidate data:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     return NextResponse.json(
//       { error: "Failed to save candidate data", details: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: Request) {
//   try {
//     await connectToDatabase();

//     const { searchParams } = new URL(request.url);
//     const indexNumber = searchParams.get("indexNumber");

//     if (!indexNumber) {
//       return NextResponse.json(
//         { error: "Index number is required" },
//         { status: 400 }
//       );
//     }

//     const candidate = await Candidate.findOne({ indexNumber });

//     if (!candidate) {
//       return NextResponse.json(
//         { error: "Candidate not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(candidate);
//   } catch (error) {
//     console.error("Error fetching candidate:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch candidate data" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import Candidate from "@/models/Candidate";
import { connectToDatabase } from "@/lib/db";

// Helper function to format file data consistently
const formatFileData = (
  file: string | { name: string; url: string; _id?: string }
) => {
  if (typeof file === "string") {
    // Extract filename from URL
    const fileName = file.split("/").pop() || "file";
    return {
      name: fileName,
      url: file,
    };
  }
  // If it's already an object, return without _id
  const { _id, ...fileData } = file;
  return fileData;
};

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const candidateData = await request.json();
    console.log(
      "Received candidate data:",
      JSON.stringify(candidateData, null, 2)
    );

    // Format the uploads data to match the schema
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

    const formattedData = {
      ...candidateData,
      uploads: formattedUploads,
    };

    // Try to find an existing document with the same indexNumber
    const existingCandidate = await Candidate.findOne({
      indexNumber: candidateData.indexNumber,
    });

    if (existingCandidate) {
      const updatedCandidate = await Candidate.findOneAndUpdate(
        { indexNumber: candidateData.indexNumber },
        formattedData,
        {
          new: true,
          runValidators: true,
        }
      );

      return NextResponse.json({
        message: "Candidate Data Updated Successfully!",
        candidate: updatedCandidate,
        applicationNumber: candidateData.applicationNumber,
      });
    } else {
      const newCandidate = new Candidate(formattedData);
      await newCandidate.save();

      return NextResponse.json({
        message: "Candidate Data Saved Successfully!",
        candidate: newCandidate,
        applicationNumber: candidateData.applicationNumber,
      });
    }
  } catch (error: unknown) {
    console.error("Error saving candidate data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to save candidate data.", details: errorMessage },
      { status: 500 }
    );
  }
}
