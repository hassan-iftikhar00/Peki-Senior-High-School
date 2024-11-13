import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import { connectToDatabase } from "@/lib/db";
import DocumentModel from "@/models/Documents";

export async function POST(req: NextRequest) {
  try {
    // Extract the type from the URL
    const type = req.nextUrl.pathname.split("/").pop();
    const data = await req.json();

    console.log("Received data for PDF generation:", data);

    const documentType = type as "admissionLetter" | "personalRecord";
    if (!["admissionLetter", "personalRecord"].includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    if (!data.applicationNumber) {
      return NextResponse.json(
        { error: "Application number is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();
    console.log("Connected to MongoDB");

    // Fetch the template URL from the database
    const templateDocument = await DocumentModel.findOne({
      type:
        documentType === "admissionLetter"
          ? "admissionLetterTemplate"
          : "personalRecordTemplate",
    });

    if (!templateDocument) {
      console.error(`Template not found for type: ${documentType}`);
      return NextResponse.json(
        { error: `Template not found for type: ${documentType}` },
        { status: 404 }
      );
    }

    console.log(`Template found: ${JSON.stringify(templateDocument)}`);

    const pdfBytes = await generatePDF(
      data,
      documentType,
      templateDocument.url
    );

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${documentType}-${data.indexNumber}-${data.applicationNumber}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

interface TextPosition {
  x: number;
  y: number;
  size?: number;
  width?: number; // for images
  height?: number; // for images
}

interface TemplateCoordinates {
  [key: string]: TextPosition;
}

// Define coordinates for text placement - adjust these based on your templates
const ADMISSION_LETTER_COORDINATES: TemplateCoordinates = {
  passportPhoto: { x: 408, y: 490, width: 120, height: 120 }, // Add photo coordinates
  fullName: { x: 200, y: 615, size: 10 },
  indexNumber: { x: 200, y: 600, size: 10 },
  programme: { x: 200, y: 585, size: 10 },
  class: { x: 200, y: 570, size: 10 },
  gender: { x: 200, y: 555, size: 10 },
  residence: { x: 200, y: 540, size: 10 },
  house: { x: 200, y: 525, size: 10 },
  aggregate: { x: 200, y: 510, size: 10 },
  applicationNumber: { x: 200, y: 495, size: 10 },
};

const PERSONAL_RECORD_COORDINATES: TemplateCoordinates = {
  passportPhoto: { x: 305, y: 660, width: 80, height: 80 },
  // Fields above phoneNumber - Increment by 15
  dateOfBirth: { x: 270, y: 404, size: 10 }, // 389 + 15
  enrollmentCode: { x: 270, y: 419, size: 10 }, // 404 + 15
  nhisNo: { x: 270, y: 434, size: 10 }, // 419 + 15
  programme: { x: 270, y: 449, size: 10 }, // 434 + 15
  residence: { x: 270, y: 464, size: 10 }, // 449 + 15
  aggregate: { x: 270, y: 479, size: 10 }, // 464 + 15
  gender: { x: 270, y: 494, size: 10 }, // 479 + 15
  indexNumber: { x: 270, y: 509, size: 10 }, // 494 + 15
  fullName: { x: 270, y: 524, size: 10 }, // 509 + 15

  // phoneNumber - Unchanged
  phoneNumber: { x: 270, y: 389, size: 10 },

  // Fields below guardianName - Decrement by 14.5
  guardianName: { x: 270, y: 375, size: 10 }, // Unchanged
  guardianRelationship: { x: 270, y: 361.5, size: 10 }, // 376 - 14.5
  guardianPhone: { x: 270, y: 347, size: 10 }, // 361.5 - 14.5
  guardianWhatsapp: { x: 270, y: 332.5, size: 10 }, // 347 - 14.5
  guardianEmail: { x: 270, y: 318, size: 10 }, // 332.5 - 14.5
  presentAddress: { x: 270, y: 303.5, size: 10 }, // 318 - 14.5
  nationality: { x: 270, y: 289, size: 10 }, // 303.5 - 14.5
  homeTown: { x: 270, y: 274.5, size: 10 }, // 289 - 14.5
  religion: { x: 270, y: 260, size: 10 }, // 274.5 - 14.5
  previousSchool: { x: 270, y: 245.5, size: 10 }, // 260 - 14.5
  beceYear: { x: 270, y: 231, size: 10 }, // 245.5 - 14.5
  houseAssigned: { x: 270, y: 216.5, size: 10 }, // 231 - 14.5
  placementFormStatus: { x: 270, y: 202, size: 10 }, // 216.5 - 14.5
  nhisCardStatus: { x: 270, y: 187.3, size: 10 }, // 202 - 14.5
  idDocumentStatus: { x: 270, y: 172.8, size: 10 }, // 187.5 - 14.5
  medicalRecordsStatus: { x: 270, y: 158.3, size: 10 }, // 173 - 14.5
};

async function loadPDFTemplate(templateUrl: string) {
  try {
    const response = await fetch(templateUrl);
    if (!response.ok) {
      console.error(
        `Template fetch failed: ${response.status} ${response.statusText}`
      );
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }
    const templateBytes = await response.arrayBuffer();
    return await PDFDocument.load(templateBytes);
  } catch (error) {
    console.error("Error loading template:", error);
    throw new Error("Failed to load PDF template");
  }
}

async function fetchImageAsBytes(imageUrl: string): Promise<Uint8Array> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use sharp to convert the image to JPEG format
    const jpegBuffer = await sharp(buffer).jpeg().toBuffer();

    return new Uint8Array(jpegBuffer);
  } catch (error) {
    console.error("Error fetching or processing image:", error);
    throw new Error("Failed to fetch or process passport photo");
  }
}

async function generatePDF(
  data: any,
  type: "admissionLetter" | "personalRecord",
  templateUrl: string
) {
  const pdfDoc = await loadPDFTemplate(templateUrl);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const coordinates =
    type === "admissionLetter"
      ? ADMISSION_LETTER_COORDINATES
      : PERSONAL_RECORD_COORDINATES;

  if (data.passportPhoto) {
    try {
      const imageBytes = await fetchImageAsBytes(data.passportPhoto);
      const image = await pdfDoc.embedJpg(imageBytes);
      const photoCoords = coordinates.passportPhoto;

      page.drawImage(image, {
        x: photoCoords.x,
        y: photoCoords.y,
        width: photoCoords.width,
        height: photoCoords.height,
      });
    } catch (error) {
      console.error("Error embedding passport photo:", error);
      // Continue with the rest of the PDF generation even if photo fails
    }
  }

  if (type === "admissionLetter") {
    // Draw text fields as before
    const fields = {
      [data.fullName]: coordinates.fullName,
      [data.indexNumber]: coordinates.indexNumber,
      [data.programme]: coordinates.programme,
      [data.academicInfo?.selectedClass || ""]: coordinates.class,
      [data.gender]: coordinates.gender,
      [data.residence]: coordinates.residence,
      [data.houseAssigned || ""]: coordinates.house,
      [data.aggregate.toString()]: coordinates.aggregate,
      [data.applicationNumber]: coordinates.applicationNumber,
    };

    Object.entries(fields).forEach(([text, pos]) => {
      if (text && text.trim()) {
        page.drawText(text, {
          x: pos.x,
          y: pos.y,
          size: pos.size || 12,
          font: font,
        });
      }
    });
  } else {
    const uploadFields = {
      placementFormStatus:
        Array.isArray(data.uploads?.placementForm) &&
        data.uploads.placementForm.length > 0
          ? "Yes"
          : "No",
      nhisCardStatus: data.uploads?.nhisCard?.url ? "Yes" : "No",
      idDocumentStatus: data.uploads?.idDocument?.url ? "Yes" : "No",
      medicalRecordsStatus:
        Array.isArray(data.uploads?.medicalRecords) &&
        data.uploads.medicalRecords.length > 0
          ? "Yes"
          : "No",
    };

    console.log("Upload fields to be drawn:", uploadFields);

    // Create the complete fields object
    const fields = {
      // Personal Info
      [data.fullName]: coordinates.fullName,
      [data.indexNumber]: coordinates.indexNumber,
      [data.gender]: coordinates.gender,
      [data.aggregate.toString()]: coordinates.aggregate,
      [data.residence]: coordinates.residence,
      [data.programme]: coordinates.programme,
      [data.nhisNo]: coordinates.nhisNo,
      [data.enrollmentCode || "N/A"]: coordinates.enrollmentCode,
      [data.dateOfBirth || "N/A"]: coordinates.dateOfBirth,
      [data.phoneNumber]: coordinates.phoneNumber,

      // Guardian Info
      [data.guardianInfo.guardianName]: coordinates.guardianName,
      [data.guardianInfo.relationship]: coordinates.guardianRelationship,
      [data.guardianInfo.phoneNumber]: coordinates.guardianPhone,
      [data.guardianInfo.whatsappNumber || "N/A"]: coordinates.guardianWhatsapp,
      [data.guardianInfo.email || "N/A"]: coordinates.guardianEmail,

      // Additional Info
      [data.additionalInfo.presentAddress]: coordinates.presentAddress,
      [data.additionalInfo.nationality]: coordinates.nationality,
      [data.additionalInfo.homeTown]: coordinates.homeTown,
      [data.additionalInfo.religion]: coordinates.religion,
      [data.additionalInfo.previousSchool]: coordinates.previousSchool,
      [data.additionalInfo.beceYear]: coordinates.beceYear,
      [data.houseAssigned || "Not Assigned"]: coordinates.houseAssigned,
    };
    // Draw all fields
    Object.entries(fields).forEach(([text, pos]) => {
      if (text && text.trim()) {
        page.drawText(text, {
          x: pos.x,
          y: pos.y,
          size: pos.size || 12,
          font: font,
        });
      }
    });
    Object.entries(uploadFields).forEach(([field, value]) => {
      const pos = coordinates[field as keyof typeof coordinates];
      if (pos) {
        console.log(`Drawing upload status: "${value}" for ${field} at:`, pos);
        page.drawText(value, {
          x: pos.x,
          y: pos.y,
          size: pos.size || 12,
          font: font,
        });
      } else {
        console.warn(`Coordinates not found for field: ${field}`);
      }
    });
  }

  return await pdfDoc.save();
}
