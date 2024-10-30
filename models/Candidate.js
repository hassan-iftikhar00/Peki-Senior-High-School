// import mongoose from "mongoose";

// const FileUploadSchema = new mongoose.Schema({
//   name: String,
//   url: String,
// });

// const CandidateSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   indexNumber: { type: String, required: true },
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
//     match: /^\d{6}-\d{3}$/, // Ensures format DDMMYY-XXX
//   },

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
//     gender: { type: String },
//     houseAssigned: { type: String },
//   },
//   uploads: {
//     placementForm: [
//       {
//         name: { type: String },
//         url: { type: String },
//       },
//     ],
//     nhisCard: {
//       name: { type: String },
//       url: { type: String },
//     },
//     idDocument: {
//       name: { type: String },
//       url: { type: String },
//     },
//     medicalRecords: [
//       {
//         name: { type: String },
//         url: { type: String },
//       },
//     ],
//   },
// });

// CandidateSchema.index({ applicationNumber: 1 }, { unique: true });
// CandidateSchema.index({ indexNumber: 1 }, { unique: true });

// export default mongoose.models.Candidate ||
//   mongoose.model("Candidate", CandidateSchema);

import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  name: String,
  url: String,
  _id: { type: String, required: false }, // Allow _id to be optional
});

const CandidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  indexNumber: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  aggregate: { type: Number, required: true },
  residence: { type: String, required: true },
  programme: { type: String, required: true },
  nhisNo: { type: String, required: true },
  enrollmentCode: { type: String, required: true },
  passportPhoto: { type: String, required: true },
  phoneNumber: { type: String },
  pin: { type: String, required: false },
  serialNumber: { type: String, required: false },
  applicationNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{6}-\d{3}$/, // Format: DDMMYY-XXX
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
    gender: { type: String },
    houseAssigned: { type: String },
  },
  uploads: {
    placementForm: [FileSchema],
    nhisCard: FileSchema,
    idDocument: FileSchema,
    medicalRecords: [FileSchema],
  },
});

// Add indexes for better query performance
CandidateSchema.index({ applicationNumber: 1 }, { unique: true });
CandidateSchema.index({ indexNumber: 1 }, { unique: true });

export default mongoose.models.Candidate ||
  mongoose.model("Candidate", CandidateSchema);