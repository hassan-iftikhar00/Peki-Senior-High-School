import House from "@/models/House";
import mongoose from "mongoose";

export async function assignHouse(
  gender: string
): Promise<mongoose.Types.ObjectId | null> {
  const houses = await House.find({ gender }).sort({ currentOccupancy: 1 });

  for (const house of houses) {
    if (house.currentOccupancy < house.capacity) {
      house.currentOccupancy += 1;
      await house.save();
      return house._id;
    }
  }

  return null; // No available houses
}
