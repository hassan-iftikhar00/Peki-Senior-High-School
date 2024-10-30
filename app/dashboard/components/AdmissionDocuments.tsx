"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";

interface ApplicantData {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: string;
  residence: string;
  programme: string;
  nhisNo: string;
  enrollmentCode: string;
  houseAssigned: string;
  passportPhoto: string;
  phoneNumber: string;
  guardianInfo: GuardianData;
  additionalInfo: AdditionalInfoData;
  academicInfo: AcademicData;
  uploads: UploadStatus;
  applicationNumber?: string;
}

interface GuardianData {
  guardianName: string;
  relationship: string;
  phoneNumber: string;
  whatsappNumber?: string;
  email?: string;
}

interface AdditionalInfoData {
  presentAddress: string;
  nationality: string;
  homeTown: string;
  religion: string;
  previousSchool: string;
  beceYear: string;
}

interface AcademicData {
  selectedClass: string;
  classCapacity: string;
  coreSubjects: string[];
  electiveSubjects: string[];
}

interface UploadStatus {
  placementForm: any[];
  nhisCard: any;
  idDocument: any;
  medicalRecords: any[];
}

interface AdmissionDocumentsProps {
  candidateData: ApplicantData;
}

export default function AdmissionDocuments({
  candidateData,
}: AdmissionDocumentsProps) {
  const [isGenerating, setIsGenerating] = useState<{
    admissionLetter: boolean;
    personalRecord: boolean;
  }>({
    admissionLetter: false,
    personalRecord: false,
  });
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    console.log("AdmissionDocuments received data:", candidateData);
  }, [candidateData]);

  const handleProspectusDownload = async () => {
    setLoadingMessage(`Generating ${DocumentType}...`);
    try {
      // Replace with your actual Cloudinary JPG URL
      const prospectusUrl =
        "https://res.cloudinary.com/dah9roj2d/image/upload/v1730303171/ctnvh3kr5kqtrsibf4dg.jpg";

      // Fetch the image
      const response = await fetch(prospectusUrl);
      if (!response.ok) throw new Error("Failed to fetch prospectus");

      // Get the blob from the response
      const blob = await response.blob();

      // Create object URL from blob
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = "peki-shs-prospectus.jpg"; // Changed extension to .jpg
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setLoadingMessage("");
    } catch (error) {
      console.error("Error downloading prospectus:", error);
      alert("Failed to download prospectus. Please try again.");
    }
  };

  const handleClick = async (
    documentType: "admissionLetter" | "personalRecord"
  ) => {
    setLoadingMessage(`Generating ${documentType}...`);

    if (!candidateData.applicationNumber) {
      alert("Application number is required to generate documents");
      return;
    }

    setIsGenerating((prev) => ({ ...prev, [documentType]: true }));

    try {
      const response = await fetch(`/api/generate-pdf/${documentType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentType}-${candidateData.indexNumber}-${candidateData.applicationNumber}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate document"
      );
    } finally {
      setLoadingMessage("");
      setIsGenerating((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  return (
    <div id="admission-documents" className="section action-section">
      <LoadingOverlay isVisible={!!loadingMessage} message={loadingMessage} />
      <h2>Admission Documents</h2>
      <p className="subtitle headings">Download your admission documents!</p>

      {candidateData.applicationNumber ? (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-download">
          <p className="text-download-status">
            You can now download your admission documents
          </p>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-download">
          <p className="text-yellow-800">
            Please submit your application to generate admission documents
          </p>
        </div>
      )}

      <div className="action-buttons space-y-4">
        <button
          className="action-button primary w-full flex items-center justify-center gap-2 p-3 rounded"
          onClick={() => handleClick("personalRecord")}
          disabled={
            isGenerating.personalRecord || !candidateData.applicationNumber
          }
        >
          {isGenerating.personalRecord ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin download-btn-mar" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 download-btn-mar" />
              Download Personal Record
            </>
          )}
        </button>
        <button
          className="action-button primary w-full flex items-center justify-center gap-2 p-3 rounded"
          onClick={() => handleClick("admissionLetter")}
          disabled={isGenerating.admissionLetter}
        >
          {isGenerating.admissionLetter ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin download-btn-mar" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 download-btn-mar" />
              Download Admission Letter
            </>
          )}
        </button>

        <button
          className="action-button secondary w-full flex items-center justify-center gap-2 p-3 rounded bg-green-600 hover:bg-green-700 text-white"
          onClick={handleProspectusDownload}
        >
          <Download className="w-4 h-4 download-btn-mar" />
          Download Prospectus
        </button>
      </div>
    </div>
  );
}
