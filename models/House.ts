import mongoose, { Document, Model } from "mongoose";

export interface IHouse extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  gender: "Male" | "Female";
  capacity: number;
  currentOccupancy: number;
}

const HouseSchema = new mongoose.Schema<IHouse>({
  name: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  capacity: { type: Number, default: 400 },
  currentOccupancy: { type: Number, default: 0 },
});

export type HouseModel = Model<IHouse>;

const House: HouseModel =
  (mongoose.models.House as HouseModel) ||
  mongoose.model<IHouse>("House", HouseSchema);

export default House;
