// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
// import Candidate from "@/models/Candidate";

// export async function GET(request: Request) {
//   try {
//     await connectToDatabase();

//     // Get total count of candidates
//     const count = await Candidate.countDocuments();

//     // Generate formatted number
//     const today = new Date();
//     const dd = String(today.getDate()).padStart(2, "0");
//     const mm = String(today.getMonth() + 1).padStart(2, "0");
//     const yy = String(today.getFullYear()).slice(-2);

//     // Format: DDMMYY-XXX where XXX is the count + 1 padded to 3 digits
//     const applicationNumber = `${dd}${mm}${yy}-${String(count + 1).padStart(
//       3,
//       "0"
//     )}`;

//     // Verify this number doesn't already exist
//     const existingNumber = await Candidate.findOne({ applicationNumber });
//     if (existingNumber) {
//       // In the unlikely case of a collision, increment until we find an unused number
//       let increment = count + 2;
//       let newNumber;
//       do {
//         newNumber = `${dd}${mm}${yy}-${String(increment).padStart(3, "0")}`;
//         increment++;
//       } while (await Candidate.findOne({ applicationNumber: newNumber }));

//       return NextResponse.json({ applicationNumber: newNumber });
//     }

//     return NextResponse.json({ applicationNumber });
//   } catch (error) {
//     console.error("Error generating application number:", error);
//     return NextResponse.json(
//       { error: "Failed to generate application number" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const indexNumber = searchParams.get("indexNumber");

    // If index number provided, check for existing application number
    if (indexNumber) {
      const existingCandidate = await Candidate.findOne({ indexNumber });
      if (existingCandidate?.applicationNumber) {
        return NextResponse.json({
          applicationNumber: existingCandidate.applicationNumber,
          isExisting: true,
        });
      }
    }

    // Generate new application number
    const count = await Candidate.countDocuments();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yy = String(today.getFullYear()).slice(-2);

    let applicationNumber = `${dd}${mm}${yy}-${String(count + 1).padStart(
      3,
      "0"
    )}`;

    // Verify this number doesn't already exist
    const existingNumber = await Candidate.findOne({ applicationNumber });
    if (existingNumber) {
      let increment = count + 2;
      do {
        applicationNumber = `${dd}${mm}${yy}-${String(increment).padStart(
          3,
          "0"
        )}`;
        increment++;
      } while (await Candidate.findOne({ applicationNumber }));
    }

    return NextResponse.json({
      applicationNumber,
      isExisting: false,
    });
  } catch (error) {
    console.error("Error generating application number:", error);
    return NextResponse.json(
      { error: "Failed to generate application number" },
      { status: 500 }
    );
  }
}