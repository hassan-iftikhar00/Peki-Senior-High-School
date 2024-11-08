import mongoose, { Document, Model, Types } from "mongoose";

export interface ICandidate {
  fullName: string;
  indexNumber: string;
  programme: string;
  gender: string;
  residence: string;
  aggregate: number;
  feePaid: boolean;
  nhisNo: string;
  track: string;
  action: string;
  enrollmentCode: string;
  houseAssigned?: string;
  house?: Types.ObjectId;
  houseId?: string;
  houseName?: string;
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
  uploads: {
    placementForm?: { name: string; url: string }[];
    nhisCard?: { name: string; url: string };
    idDocument?: { name: string; url: string };
    medicalRecords?: { name: string; url: string }[];
  };
}

export interface ICandidateDocument extends Omit<ICandidate, "_id">, Document {}

const FileSchema = new mongoose.Schema({
  name: String,
  url: String,
  _id: { type: String, required: false },
});

const CandidateSchema = new mongoose.Schema<ICandidateDocument>(
  {
    fullName: { type: String, required: true },
    indexNumber: { type: String, required: true, unique: true },
    programme: { type: String, required: true },
    gender: { type: String, required: true },
    residence: { type: String, required: true },
    aggregate: { type: Number, required: true },
    feePaid: { type: Boolean, default: false },
    nhisNo: { type: String },
    enrollmentCode: { type: String },
    houseAssigned: String,
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: false,
    },
    houseId: { type: String },
    houseName: { type: String },
    passportPhoto: { type: String },
    phoneNumber: { type: String },
    serialNumber: { type: String, unique: true },
    pin: { type: String },
    lastUpdated: { type: Date },
    track: { type: String },
    action: { type: String },
    applicationNumber: {
      type: String,
      unique: true,
    },
    guardianInfo: {
      guardianName: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String },
      whatsappNumber: { type: String },
      email: { type: String },
    },
    additionalInfo: {
      presentAddress: { type: String },
      nationality: { type: String },
      homeTown: { type: String },
      religion: { type: String },
      previousSchool: { type: String },
      beceYear: { type: String },
    },
    academicInfo: {
      coreSubjects: [{ type: String }],
      electiveSubjects: [{ type: String }],
      selectedClass: { type: String },
      classCapacity: { type: Number },
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

export interface CandidateModel extends Model<ICandidateDocument> {}

// Check if the model already exists before compiling it
const Candidate =
  (mongoose.models.Candidate as CandidateModel) ||
  mongoose.model<ICandidateDocument, CandidateModel>(
    "Candidate",
    CandidateSchema
  );

export default Candidate;
