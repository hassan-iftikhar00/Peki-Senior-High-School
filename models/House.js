import mongoose from "mongoose";

const HouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  capacity: { type: Number, default: 400 },
  currentOccupancy: { type: Number, default: 0 },
});

mongoose.models = {};
export default mongoose.models.House || mongoose.model("House", HouseSchema);
