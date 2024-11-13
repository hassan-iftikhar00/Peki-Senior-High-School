import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import DocumentModel from "@/models/Documents";
import { verifyToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/app/utils/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get("type");

    await connectToDatabase();

    let documents;
    if (type && type !== "all") {
      console.log(`Searching for document with type: ${type}`);
      documents = await DocumentModel.findOne({ type });
      console.log(`Found document:`, documents);
    } else {
      console.log("Fetching all documents");
      documents = await DocumentModel.find({});
      console.log(`Found ${documents.length} documents`);
    }

    if (!documents || (Array.isArray(documents) && documents.length === 0)) {
      return NextResponse.json(
        { error: "No documents found" },
        { status: 404 }
      );
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching document(s):", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the document(s)" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const _id = formData.get("_id") as string;
    const file = formData.get("file") as File;

    if (!_id || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const url = await uploadToCloudinary(file);

    const updatedDocument = await DocumentModel.findByIdAndUpdate(
      _id,
      { url },
      { new: true }
    );

    if (!updatedDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id } = await request.json();

    await connectToDatabase();

    const deletedDocument = await DocumentModel.findByIdAndDelete(_id);

    if (!deletedDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the document" },
      { status: 500 }
    );
  }
}
