import mongoose from "mongoose";

const ProgrammeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Check if the model already exists before creating a new one
const Programme =
  mongoose.models.Programme || mongoose.model("Programme", ProgrammeSchema);

export default Programme;
