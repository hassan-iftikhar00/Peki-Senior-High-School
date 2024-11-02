// import mongoose from "mongoose";

// const FileSchema = new mongoose.Schema({
//   name: String,
//   url: String,
//   _id: { type: String, required: false },
// });

// const CandidateSchema = new mongoose.Schema({
//   feePaid: { type: Boolean, default: false },
//   fullName: { type: String, required: true },
//   indexNumber: { type: String, required: true, unique: true },
//   gender: { type: String, required: true },
//   aggregate: { type: Number, required: true },
//   residence: { type: String, required: true },
//   programme: { type: String, required: true },
//   nhisNo: { type: String, required: true },
//   enrollmentCode: { type: String, required: true },
//   passportPhoto: { type: String, required: true },
//   phoneNumber: { type: String },
//   pin: { type: String, required: false },
//   serialNumber: { type: String, required: false },
//   applicationNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     match: /^\d{6}-\d{3}$/, // Format: DDMMYY-XXX
//   },
//   // New field
//   guardianInfo: {
//     guardianName: { type: String, required: true },
//     relationship: { type: String, required: true },
//     phoneNumber: { type: String, required: true },
//     whatsappNumber: { type: String },
//     email: { type: String },
//   },
//   additionalInfo: {
//     presentAddress: { type: String, required: true },
//     nationality: { type: String, required: true },
//     homeTown: { type: String, required: true },
//     religion: { type: String, required: true },
//     previousSchool: { type: String, required: true },
//     beceYear: { type: String, required: true },
//   },
//   academicInfo: {
//     coreSubjects: [{ type: String }],
//     electiveSubjects: [{ type: String }],
//     selectedClass: { type: String, required: true },
//     classCapacity: { type: Number },
//   },
//   house: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "House",
//   },
//   uploads: {
//     placementForm: [FileSchema],
//     nhisCard: FileSchema,
//     idDocument: FileSchema,
//     medicalRecords: [FileSchema],
//   },
// });

// CandidateSchema.index({ applicationNumber: 1 }, { unique: true });
// CandidateSchema.index({ indexNumber: 1 }, { unique: true });
// mongoose.models = {};
// export default mongoose.models.Candidate ||
//   mongoose.model("Candidate", CandidateSchema);

import mongoose, { Document, Model } from "mongoose";

export interface ICandidate extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  indexNumber: string;
  programme: string;
  gender: string;
  residence: string;
  aggregate: number;
  feePaid: boolean;
  nhisNo: string;
  enrollmentCode: string;
  houseAssigned?: string;
  passportPhoto: string;
  phoneNumber?: string;
  serialNumber: string;
  pin: string;
  lastUpdated?: Date;
  applicationNumber?: string;
  guardianInfo: {
    guardianName: string;
    relationship: string;
    phoneNumber: string;
    whatsappNumber?: string;
    email?: string;
  };
  additionalInfo: {
    presentAddress: string;
    nationality: string;
    homeTown: string;
    religion: string;
    previousSchool: string;
    beceYear: string;
  };
  academicInfo: {
    coreSubjects: string[];
    electiveSubjects: string[];
    selectedClass: string;
    classCapacity?: number;
  };
  house?: mongoose.Types.ObjectId;
  uploads: {
    placementForm?: { name: string; url: string }[];
    nhisCard?: { name: string; url: string };
    idDocument?: { name: string; url: string };
    medicalRecords?: { name: string; url: string }[];
  };
}

const FileSchema = new mongoose.Schema({
  name: String,
  url: String,
  _id: { type: String, required: false },
});

const CandidateSchema = new mongoose.Schema<ICandidate>(
  {
    fullName: { type: String, required: true },
    indexNumber: { type: String, required: true, unique: true },
    programme: { type: String, required: true },
    gender: { type: String, required: true },
    residence: { type: String, required: true },
    aggregate: { type: Number, required: true },
    feePaid: { type: Boolean, default: false },
    nhisNo: { type: String, required: true },
    enrollmentCode: { type: String, required: true },
    houseAssigned: String,
    passportPhoto: { type: String, required: true },
    phoneNumber: { type: String },
    serialNumber: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    lastUpdated: { type: Date },
    applicationNumber: {
      type: String,
      required: false,
      validate: {
        validator: function (v: string) {
          return !v || /^\d{6}-\d{4}$/.test(v);
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid application number! Format should be XXXXXX-XXXX`,
      },
    },
    guardianInfo: {
      guardianName: { type: String, required: true },
      relationship: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      whatsappNumber: { type: String },
      email: { type: String },
    },
    additionalInfo: {
      presentAddress: { type: String, required: true },
      nationality: { type: String, required: true },
      homeTown: { type: String, required: true },
      religion: { type: String, required: true },
      previousSchool: { type: String, required: true },
      beceYear: { type: String, required: true },
    },
    academicInfo: {
      coreSubjects: [{ type: String }],
      electiveSubjects: [{ type: String }],
      selectedClass: { type: String, required: true },
      classCapacity: { type: Number },
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: false,
    },
    uploads: {
      placementForm: [FileSchema],
      nhisCard: FileSchema,
      idDocument: FileSchema,
      medicalRecords: [FileSchema],
    },
  },
  { timestamps: true }
);

CandidateSchema.index({ applicationNumber: 1 }, { unique: true, sparse: true });
CandidateSchema.index({ indexNumber: 1 }, { unique: true });

interface CandidateModel extends Model<ICandidate> {
  // Add any static methods here if needed
}

const Candidate =
  (mongoose.models.Candidate as CandidateModel) ||
  mongoose.model<ICandidate, CandidateModel>("Candidate", CandidateSchema);

export default Candidate;
