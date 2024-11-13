import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    occupancy: {
      type: Number,
      required: true,
    },
    electiveSubjects: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);
