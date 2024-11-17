// models/Class.ts
import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Programme",
    required: true,
  },
  capacity: { type: Number, required: true },
  occupancy: { type: Number, default: 0 },
  coreSubjects: { type: [String], default: [] },
  electiveSubjects: { type: [String], default: [] },
});

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);
