"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PersonalInfo from "./components/PersonalInfo";
import AcademicInfo from "./components/AcademicInfo";
import House from "./components/House";
import Uploads, { UploadStatus } from "./components/Uploads";
import Submit from "./components/Submit";
import AdmissionDocuments from "./components/AdmissionDocuments";
import GuardianInfo from "./components/GuardianInfo";
import AdditionalInfo from "./components/AdditionalInfo";
import Footer from "../../components/Footer";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Loader2 } from "lucide-react";
import { uploadToCloudinary } from ".././utils/cloudinary";
import "./dashboard.css";

export interface ApplicantData {
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

export interface GuardianData {
  guardianName: string;
  relationship: string;
  phoneNumber: string;
  whatsappNumber?: string;
  email?: string;
}

export interface AdditionalInfoData {
  presentAddress: string;
  nationality: string;
  homeTown: string;
  religion: string;
  previousSchool: string;
  beceYear: string;
}

export interface AcademicData {
  selectedClass: string;
  classCapacity: string;
  coreSubjects: string[];
  electiveSubjects: string[];
}

export default function Dashboard() {
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  const fetchApplicantData = useCallback(async () => {
    if (!isLoading) return;

    try {
      const response = await fetch("/api/applicant-data", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data && Object.keys(data).length > 0) {
        if (!data.uploads) {
          data.uploads = {
            placementForm: [],
            nhisCard: null,
            idDocument: null,
            medicalRecords: [],
          };
        }
        setApplicantData(data);
        const wasSubmitted = !!data.applicationNumber;
        setIsSubmitted(wasSubmitted);
        setIsEditMode(!wasSubmitted);
      } else {
        throw new Error("No applicant data found");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch applicant data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [router, isLoading]);

  useEffect(() => {
    fetchApplicantData();
  }, [fetchApplicantData]);

  const handlePersonalInfoChange = (
    field: keyof ApplicantData,
    value: string
  ) => {
    // Only block changes if submitted AND not in edit mode
    if (isSubmitted && !isEditMode) return;
    setApplicantData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        [field]: value,
      };
    });
  };

  const handleAdditionalChange = (
    field: keyof AdditionalInfoData,
    value: string
  ) => {
    if (isSubmitted && !isEditMode) return;
    setApplicantData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        additionalInfo: {
          ...prevData.additionalInfo,
          [field]: value,
        },
      };
    });
  };

  const handleGuardianChange = (field: keyof GuardianData, value: string) => {
    if (isSubmitted && !isEditMode) return;
    setApplicantData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        guardianInfo: {
          ...prevData.guardianInfo,
          [field]: value,
        },
      };
    });
  };

  const handleAcademicChange = (
    field: keyof AcademicData,
    value: string | string[]
  ) => {
    if (isSubmitted && !isEditMode) return;
    setApplicantData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        academicInfo: {
          ...prevData.academicInfo,
          [field]: value,
        },
      };
    });
  };

  const handleUploadStatusChange = useCallback(
    (newUploadStatus: UploadStatus) => {
      if (isSubmitted && !isEditMode) return;
      setApplicantData((prevData) =>
        prevData ? { ...prevData, uploads: newUploadStatus } : null
      );
    },
    [isSubmitted, isEditMode] // Add these dependencies
  );

  const handleSubmissionComplete = useCallback((applicationNumber: string) => {
    setApplicantData((prev) =>
      prev
        ? {
            ...prev,
            applicationNumber,
          }
        : null
    );
    setIsSubmitted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        <span className="text-xl font-semibold">Loading...</span>
      </div>
    );
  }

  if (error || !applicantData) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              "Failed to load applicant data. Please try refreshing the page or contact support if the problem persists."}
          </AlertDescription>
        </Alert>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push("/")}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div
      className="dashboard-container"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: "280px" }}>
          <Sidebar />
        </div>
        <div style={{ flex: 1 }}>
          <TopBar
            applicantName={applicantData.fullName}
            passportPhoto={applicantData.passportPhoto}
          />
        </div>
      </div>
      <div
        className="main-content"
        style={{ flex: 1, overflow: "auto", marginLeft: "280px" }}
      >
        <div className="content-area">
          <PersonalInfo
            applicantData={applicantData}
            onChange={handlePersonalInfoChange}
            isDisabled={isSubmitted && !isEditMode}
          />
          <GuardianInfo
            guardianInfo={applicantData.guardianInfo}
            onChange={handleGuardianChange}
            isDisabled={isSubmitted && !isEditMode}
          />
          <AdditionalInfo
            additionalInfo={applicantData.additionalInfo}
            onChange={handleAdditionalChange}
            isDisabled={isSubmitted && !isEditMode}
          />
          <AcademicInfo
            programme={applicantData.programme}
            academicInfo={applicantData.academicInfo}
            setAcademicData={handleAcademicChange}
            isDisabled={isSubmitted && !isEditMode}
          />
          <House
            gender={applicantData.gender}
            houseAssigned={applicantData.houseAssigned}
          />
          <Uploads
            initialUploadStatus={applicantData.uploads}
            onUploadStatusChange={handleUploadStatusChange}
            isDisabled={isSubmitted && !isEditMode}
          />
          <Submit
            applicantData={applicantData}
            guardianData={applicantData.guardianInfo}
            additionalData={applicantData.additionalInfo}
            academicData={applicantData.academicInfo}
            houseData={{
              gender: applicantData.gender,
              houseAssigned: applicantData.houseAssigned,
            }}
            uploadStatus={applicantData.uploads}
            onSubmit={() => setIsSubmitted(true)}
            onEdit={() => setIsEditMode(true)}
            onSave={() => setIsEditMode(false)}
            isSubmitted={isSubmitted}
            isEditMode={isEditMode}
          />
          <AdmissionDocuments candidateData={applicantData} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
