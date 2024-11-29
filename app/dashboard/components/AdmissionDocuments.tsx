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
  feePaid: boolean;
  houseId: string;
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
    prospectus: boolean;
  }>({
    admissionLetter: false,
    personalRecord: false,
    prospectus: false,
  });
  const [loadingMessage, setLoadingMessage] = useState("");
  const [prospectusUrl, setProspectusUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AdmissionDocuments received data:", candidateData);
    fetchProspectusUrl();
  }, []);

  const fetchProspectusUrl = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/documents?type=prospectus");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch prospectus URL: ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Received data from API:", data); // Log the entire response
      if (data && data.url) {
        setProspectusUrl(data.url);
        console.log("Set prospectus URL to:", data.url); // Log the URL being set
      } else {
        throw new Error("Prospectus URL not found in response");
      }
    } catch (error) {
      console.error("Error fetching prospectus URL:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch prospectus URL"
      );
      setProspectusUrl(null);
    }
  };

  const handleProspectusDownload = async () => {
    if (!prospectusUrl) {
      setError("Prospectus URL not available. Please try refreshing the page.");
      return;
    }

    setIsGenerating((prev) => ({ ...prev, prospectus: true }));
    setLoadingMessage(`Downloading Prospectus`);
    try {
      console.log("Attempting to download prospectus from:", prospectusUrl);

      const response = await fetch(prospectusUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch prospectus: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "peki-shs-prospectus.pdf";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading prospectus:", error);
      setError(
        error instanceof Error ? error.message : "Failed to download prospectus"
      );
    } finally {
      setLoadingMessage("");
      setIsGenerating((prev) => ({ ...prev, prospectus: false }));
    }
  };

  const handleClick = async (
    documentType: "admissionLetter" | "personalRecord"
  ) => {
    if (!candidateData.applicationNumber) {
      alert("Application number is required to generate documents");
      return;
    }

    setIsGenerating((prev) => ({ ...prev, [documentType]: true }));
    setLoadingMessage(`Generating ${documentType}`);

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
      link.download = `${documentType}-${candidateData.applicationNumber}.pdf`;

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <p>{error}</p>
          <button
            onClick={fetchProspectusUrl}
            className="mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )}

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
          disabled={
            isGenerating.admissionLetter || !candidateData.applicationNumber
          }
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
          disabled={isGenerating.prospectus || !prospectusUrl}
        >
          {isGenerating.prospectus ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin download-btn-mar" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 download-btn-mar" />
              Download Prospectus
            </>
          )}
        </button>
      </div>
    </div>
  );
}
