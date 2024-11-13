import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDocument {
  name: string;
  type:
    | "admissionLetterTemplate"
    | "prospectus"
    | "personalRecordTemplate"
    | "otherDocuments";
  url: string;
}

export interface IDocumentDocument extends IDocument, Document {}

const DocumentSchema: Schema<IDocumentDocument> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: [
        "admissionLetterTemplate",
        "prospectus",
        "personalRecordTemplate",
        "otherDocuments",
      ],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel =
  mongoose.models.Document ||
  mongoose.model<IDocumentDocument>("Document", DocumentSchema);

export default DocumentModel;
