import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAdminLog {
  name: string;
  timeIn: Date;
  activityDetails: string;
  timeOut: Date;
}

export interface IAdminLogDocument extends IAdminLog, Document {}

const AdminLogSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    timeIn: { type: Date, required: true },
    activityDetails: { type: String, required: true },
    timeOut: { type: Date, required: true },
  },
  { timestamps: true }
);

const AdminLog =
  (mongoose.models.AdminLog as Model<IAdminLogDocument>) ||
  mongoose.model<IAdminLogDocument>("AdminLog", AdminLogSchema);

export default AdminLog;
