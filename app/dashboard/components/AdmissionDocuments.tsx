"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";

interface CandidateData {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: number | string;
  residence: string;
  programme: string;
  nhisNo: string;
  enrollmentCode: string;
  dateOfBirth?: string;
  phoneNumber: string;
  guardianInfo: {
    guardianName: string;
    relationship: string;
    phoneNumber: string;
    whatsappNumber?: string;
    email?: string;
  };
  additionalInfo: {
    presentAddress: string;
    nationality: string;
    homeTown: string;
    religion: string;
    previousSchool: string;
    beceYear: string;
  };
  uploads: {
    placementForm: any[];
    nhisCard: any;
    idDocument: any;
    medicalRecords: any[];
  };
  houseAssigned: string;
  applicationNumber?: string;
  class?: string;
}

interface AdmissionDocumentsProps {
  candidateData: CandidateData;
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

  // Add effect to log data when component mounts or data changes
  useEffect(() => {
    console.log("AdmissionDocuments mounted/updated with data:", candidateData);
  }, [candidateData]);

  const handleClick = async (
    documentType: "admissionLetter" | "personalRecord"
  ) => {
    console.log(`Button clicked for ${documentType}`);

    if (!candidateData) {
      console.error("No candidate data available");
      alert("No candidate data available");
      return;
    }

    setIsGenerating((prev) => ({ ...prev, [documentType]: true }));

    try {
      const apiUrl = `/api/generate-pdf/${documentType}`;
      console.log("Making API request to:", apiUrl);
      console.log("With data:", candidateData);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...candidateData,
          documentType,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      const blob = await response.blob();
      console.log("Received blob:", blob);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentType}-${
        candidateData.indexNumber || "unknown"
      }.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // alert(
      //   error instanceof Error ? error.message : "Failed to generate document"
      // );
    } finally {
      setIsGenerating((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  // For testing - remove in production
  const testData = {
    ...candidateData,
    applicationNumber: candidateData.applicationNumber || "TEST-123",
  };

  return (
    <div id="admission-documents" className="section action-section">
      <h2>Admission Documents</h2>
      <p className="subtitle headings">Download your admission documents!</p>

      {/* <div className="mb-4">
        <p className="text-sm">
          Application Number: {testData.applicationNumber}
        </p>
        <p className="text-sm">Index Number: {testData.indexNumber}</p>
      </div> */}

      <div className="action-buttons space-y-4">
        <button
          className="action-button primary w-full flex items-center justify-center gap-2 p-3 rounded"
          onClick={() => handleClick("admissionLetter")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          // Temporarily remove disabled state for testing
          // disabled={isGenerating.admissionLetter || !candidateData.applicationNumber}
        >
          {isGenerating.admissionLetter ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" style={{ marginRight: "15px" }} />
              Download Admission Letter
            </>
          )}
        </button>

        <button
          className="action-button primary w-full flex items-center justify-center gap-2 p-3 rounded"
          onClick={() => handleClick("personalRecord")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          // Temporarily remove disabled state for testing
          // disabled={isGenerating.personalRecord || !candidateData.applicationNumber}
        >
          {isGenerating.personalRecord ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" style={{ marginRight: "15px" }} />
              Download Personal Record
            </>
          )}
        </button>
      </div>

      {/* Debug Information */}
      {/* <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(
            {
              hasApplicationNumber: Boolean(candidateData.applicationNumber),
              applicationNumber: candidateData.applicationNumber,
              isGeneratingLetter: isGenerating.admissionLetter,
              isGeneratingRecord: isGenerating.personalRecord,
            },
            null,
            2
          )}
        </pre>
      </div> */}
    </div>
  );
}
