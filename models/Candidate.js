import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  indexNumber: { type: String, required: true },
  gender: { type: String, required: true },
  aggregate: { type: Number, required: true },
  residence: { type: String, required: true },
  programme: { type: String, required: true },
  nhisNo: { type: String, required: true },
  passportPhoto: { type: String, required: true },
  phoneNumber: { type: String },
  pin: { type: String, required: false }, // Changed to false
  serialNumber: { type: String, required: false }, // Changed to false
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
    placementForm: { type: String },
    nhisCard: { type: String },
    idDocument: { type: String },
    medicalRecords: { type: String },
  },
});

export default mongoose.models.Candidate ||
  mongoose.model("Candidate", CandidateSchema);
