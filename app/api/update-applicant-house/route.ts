import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/db";
import Candidate from "@/models/Candidate";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToDatabase();
    const { indexNumber, houseId, houseName } = req.body;

    const updatedCandidate = await Candidate.findOneAndUpdate(
      { indexNumber },
      { $set: { houseId, houseAssigned: houseName } },
      { new: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "House assignment updated successfully" });
  } catch (error) {
    console.error("Error updating house assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
