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

import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  fullName: String,
  indexNumber: {
    type: String,
    required: true,
    unique: true,
  },
  gender: String,
  nhisNo: String,
  enrollmentCode: String,
  houseAssigned: String,
  passportPhoto: String,
  phoneNumber: String,
  guardianInfo: {
    guardianName: String,
    relationship: String,
    phoneNumber: String,
    whatsappNumber: String,
    email: String,
  },
  additionalInfo: {
    presentAddress: String,
    nationality: String,
    homeTown: String,
    religion: String,
    previousSchool: String,
    beceYear: String,
  },
  academicInfo: {
    coreSubjects: [String],
    electiveSubjects: [String],
    classCapacity: Number,
    selectedClass: String,
  },
  uploads: {
    placementForm: [{ name: String, url: String }],
    nhisCard: { name: String, url: String },
    idDocument: { name: String, url: String },
    medicalRecords: [{ name: String, url: String }],
  },
  applicationNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{6}-\d{4}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid application number! Format should be XXXXXX-XXXX`,
    },
    required: false,
  },
  feePaid: Boolean,
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
  },
});

const Candidate =
  mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);

export default Candidate;
