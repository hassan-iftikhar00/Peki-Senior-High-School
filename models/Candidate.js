import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    fullName: String,
    indexNumber: String,
    gender: String,
    aggregate: Number,
    residence: String,
    programme: String,
    nhisNo: String,
    passportPhoto: String,
    houseAssigned: String,
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
      selectedClass: String,
      classCapacity: Number,
      coreSubjects: [String],
      electiveSubjects: [String],
    },
    uploads: {
      placementForm: String,
      nhisCard: String,
      idDocument: String,
      medicalRecords: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Candidate ||
  mongoose.model("Candidate", candidateSchema);
