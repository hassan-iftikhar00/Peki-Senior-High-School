import House from "@/models/House";
import mongoose from "mongoose";

export async function assignHouse(
  gender: string
): Promise<mongoose.Types.ObjectId | null> {
  console.log(`Attempting to assign house for gender: ${gender}`);
  const normalizedGender = gender.toLowerCase();
  console.log(`Normalized gender: ${normalizedGender}`);

  try {
    const allHouses = await House.find({
      gender: { $regex: new RegExp(`^${normalizedGender}$`, "i") },
    });
    console.log(
      `All houses for ${normalizedGender}:`,
      JSON.stringify(allHouses, null, 2)
    );

    const availableHouse = await House.findOne({
      gender: { $regex: new RegExp(`^${normalizedGender}$`, "i") },
      $expr: { $lt: ["$currentOccupancy", "$capacity"] },
    }).sort({ currentOccupancy: 1 });

    if (!availableHouse) {
      console.log(`No available houses for gender: ${normalizedGender}`);
      return null;
    }

    console.log(`Found available house: ${availableHouse._id}`);
    return availableHouse._id;
  } catch (error) {
    console.error(
      `Error in assignHouse: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return null;
  }
}
