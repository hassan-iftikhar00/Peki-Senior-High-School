import { connectToDatabase } from "./db";
import DocumentModel from "@/models/Documents";

const sampleDocuments = [
  {
    name: "Admission Letter Template",
    type: "admissionLetterTemplate",
    url: "https://res.cloudinary.com/dah9roj2d/image/upload/v1730247831/zywfhieaeqvwnkk2mnsp.pdf",
  },
  {
    name: "Prospectus",
    type: "prospectus",
    url: "https://res.cloudinary.com/dah9roj2d/image/upload/v1730573617/rcmilq4ptjwk1tvcro3p.pdf",
  },
  {
    name: "Personal Record Template",
    type: "personalRecordTemplate",
    url: "https://res.cloudinary.com/dah9roj2d/image/upload/v1730247831/yp2rtvahwinj1mevvdui.pdf",
  },
];

export async function seedAdmissionDocuments() {
  try {
    await connectToDatabase();

    // Clear existing documents
    await DocumentModel.deleteMany({});

    // Insert sample documents
    const insertedDocuments = await DocumentModel.insertMany(sampleDocuments);

    console.log(
      `${insertedDocuments.length} admission documents seeded successfully.`
    );
  } catch (error) {
    console.error("Error seeding admission documents:", error);
  }
}
