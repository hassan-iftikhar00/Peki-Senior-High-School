import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICandidateLog {
  name: string;
  timeIn: Date;
  activityDetails: string;
  timeOut: Date;
}

export interface ICandidateLogDocument extends ICandidateLog, Document {}

const CandidateLogSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    timeIn: { type: Date, required: true },
    activityDetails: { type: String, required: true },
    timeOut: { type: Date, required: true },
  },
  { timestamps: true }
);

const CandidateLog =
  (mongoose.models.CandidateLog as Model<ICandidateLogDocument>) ||
  mongoose.model<ICandidateLogDocument>("CandidateLog", CandidateLogSchema);

export default CandidateLog;
