// import { NextRequest, NextResponse } from "next/server";
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// // Define template URLs - replace with your Cloudinary URLs
// const PDF_TEMPLATES = {
//   admissionLetter:
//     "https://res.cloudinary.com/dah9roj2d/raw/upload/v1/templates/admission-letter.pdf",
//   personalRecord:
//     "https://res.cloudinary.com/dah9roj2d/raw/upload/v1/templates/personal-record.pdf",
// };

// interface TextPosition {
//   x: number;
//   y: number;
//   size?: number;
// }

// interface TemplateCoordinates {
//   [key: string]: TextPosition;
// }

// // Define coordinates for text placement - adjust these based on your templates
// const ADMISSION_LETTER_COORDINATES: TemplateCoordinates = {
//   date: { x: 400, y: 700, size: 12 },
//   applicationNumber: { x: 400, y: 670, size: 12 },
//   fullName: { x: 200, y: 600, size: 12 },
//   indexNumber: { x: 200, y: 570, size: 12 },
//   programme: { x: 200, y: 540, size: 12 },
//   class: { x: 200, y: 510, size: 12 },
//   gender: { x: 200, y: 480, size: 12 },
//   residence: { x: 200, y: 450, size: 12 },
//   house: { x: 200, y: 420, size: 12 },
//   aggregate: { x: 200, y: 390, size: 12 },
// };

// const PERSONAL_RECORD_COORDINATES: TemplateCoordinates = {
//   fullName: { x: 250, y: 750, size: 12 },
//   indexNumber: { x: 250, y: 730, size: 12 },
//   gender: { x: 250, y: 710, size: 12 },
//   aggregate: { x: 250, y: 690, size: 12 },
//   residence: { x: 250, y: 670, size: 12 },
//   programme: { x: 250, y: 650, size: 12 },
//   nhisNo: { x: 250, y: 630, size: 12 },
//   enrollmentCode: { x: 250, y: 610, size: 12 },
//   phoneNumber: { x: 250, y: 590, size: 12 },
//   // Guardian Info
//   guardianName: { x: 250, y: 570, size: 12 },
//   guardianRelationship: { x: 250, y: 550, size: 12 },
//   guardianPhone: { x: 250, y: 530, size: 12 },
//   guardianWhatsapp: { x: 250, y: 510, size: 12 },
//   guardianEmail: { x: 250, y: 490, size: 12 },
//   // Additional Info
//   presentAddress: { x: 250, y: 470, size: 12 },
//   nationality: { x: 250, y: 450, size: 12 },
//   homeTown: { x: 250, y: 430, size: 12 },
//   religion: { x: 250, y: 410, size: 12 },
//   previousSchool: { x: 250, y: 390, size: 12 },
//   beceYear: { x: 250, y: 370, size: 12 },
//   houseAssigned: { x: 250, y: 350, size: 12 },
// };

// async function loadPDFTemplate(templateUrl: string) {
//   try {
//     const response = await fetch(templateUrl);
//     if (!response.ok)
//       throw new Error(`Failed to fetch template: ${response.statusText}`);
//     const templateBytes = await response.arrayBuffer();
//     return await PDFDocument.load(templateBytes);
//   } catch (error) {
//     console.error("Error loading template:", error);
//     throw new Error("Failed to load PDF template");
//   }
// }

// async function generatePDF(
//   data: any,
//   type: "admissionLetter" | "personalRecord"
// ) {
//   const templateUrl = PDF_TEMPLATES[type];
//   const pdfDoc = await loadPDFTemplate(templateUrl);
//   const page = pdfDoc.getPages()[0];
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   const coordinates =
//     type === "admissionLetter"
//       ? ADMISSION_LETTER_COORDINATES
//       : PERSONAL_RECORD_COORDINATES;

//   if (type === "admissionLetter") {
//     // Draw admission letter content
//     const fields = {
//       [`Date: ${new Date().toLocaleDateString()}`]: coordinates.date,
//       [`Application Number: ${data.applicationNumber}`]:
//         coordinates.applicationNumber,
//       [`Name: ${data.fullName}`]: coordinates.fullName,
//       [`Index Number: ${data.indexNumber}`]: coordinates.indexNumber,
//       [`Programme: ${data.programme}`]: coordinates.programme,
//       [`Class: ${data.academicInfo?.selectedClass || ""}`]: coordinates.class,
//       [`Gender: ${data.gender}`]: coordinates.gender,
//       [`Residence: ${data.residence}`]: coordinates.residence,
//       [`House: ${data.houseAssigned || ""}`]: coordinates.house,
//       [`Aggregate: ${data.aggregate}`]: coordinates.aggregate,
//     };

//     Object.entries(fields).forEach(([text, pos]) => {
//       page.drawText(text, {
//         x: pos.x,
//         y: pos.y,
//         size: pos.size || 12,
//         font: text.startsWith("Application Number:") ? boldFont : font,
//       });
//     });
//   } else {
//     // Draw personal record content
//     const fields = {
//       [`Full Name: ${data.fullName}`]: coordinates.fullName,
//       [`Index Number: ${data.indexNumber}`]: coordinates.indexNumber,
//       [`Gender: ${data.gender}`]: coordinates.gender,
//       [`Aggregate: ${data.aggregate}`]: coordinates.aggregate,
//       [`Residence: ${data.residence}`]: coordinates.residence,
//       [`Programme: ${data.programme}`]: coordinates.programme,
//       [`NHIS Number: ${data.nhisNo}`]: coordinates.nhisNo,
//       [`Enrollment Code: ${data.enrollmentCode}`]: coordinates.enrollmentCode,
//       [`Phone Number: ${data.phoneNumber}`]: coordinates.phoneNumber,
//       // Guardian Information
//       [`Guardian Name: ${data.guardianInfo.guardianName}`]:
//         coordinates.guardianName,
//       [`Relationship: ${data.guardianInfo.relationship}`]:
//         coordinates.guardianRelationship,
//       [`Guardian Phone: ${data.guardianInfo.phoneNumber}`]:
//         coordinates.guardianPhone,
//       [`WhatsApp: ${data.guardianInfo.whatsappNumber || "N/A"}`]:
//         coordinates.guardianWhatsapp,
//       [`Email: ${data.guardianInfo.email || "N/A"}`]: coordinates.guardianEmail,
//       // Additional Information
//       [`Present Address: ${data.additionalInfo.presentAddress}`]:
//         coordinates.presentAddress,
//       [`Nationality: ${data.additionalInfo.nationality}`]:
//         coordinates.nationality,
//       [`Home Town: ${data.additionalInfo.homeTown}`]: coordinates.homeTown,
//       [`Religion: ${data.additionalInfo.religion}`]: coordinates.religion,
//       [`Previous School: ${data.additionalInfo.previousSchool}`]:
//         coordinates.previousSchool,
//       [`BECE Year: ${data.additionalInfo.beceYear}`]: coordinates.beceYear,
//       [`House Assigned: ${data.houseAssigned || "Not Assigned"}`]:
//         coordinates.houseAssigned,
//     };

//     Object.entries(fields).forEach(([text, pos]) => {
//       page.drawText(text, {
//         x: pos.x,
//         y: pos.y,
//         size: pos.size || 12,
//         font: text.includes("Full Name:") ? boldFont : font,
//       });
//     });
//   }

//   return await pdfDoc.save();
// }

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { type: string } }
// ) {
//   try {
//     const data = await request.json();
//     console.log("Received data for PDF generation:", data);

//     const { type } = params;
//     const documentType = type as "admissionLetter" | "personalRecord";

//     if (!["admissionLetter", "personalRecord"].includes(documentType)) {
//       return NextResponse.json(
//         { error: "Invalid document type" },
//         { status: 400 }
//       );
//     }

//     if (!data.applicationNumber) {
//       return NextResponse.json(
//         { error: "Application number is required" },
//         { status: 400 }
//       );
//     }

//     const pdfBytes = await generatePDF(data, documentType);

//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${documentType}-${data.indexNumber}-${data.applicationNumber}.pdf"`,
//         "Content-Length": pdfBytes.length.toString(),
//         "Cache-Control": "no-cache, no-store, must-revalidate",
//       },
//     });
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to generate PDF",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }
