import House from "@/models/House";
import mongoose from "mongoose";

export async function assignHouse(
  gender: string
): Promise<mongoose.Types.ObjectId | null> {
  const normalizedGender = gender.toLowerCase();

  const availableHouse = await House.findOne({
    gender: normalizedGender,
    $expr: { $lt: ["$currentOccupancy", "$capacity"] },
  }).sort({ currentOccupancy: 1 });

  if (!availableHouse) {
    console.log(`No available houses for gender: ${normalizedGender}`);
    return null;
  }

  return availableHouse._id;
}
