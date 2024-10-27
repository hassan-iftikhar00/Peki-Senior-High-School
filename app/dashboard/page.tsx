"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import PersonalInfo from "./components/PersonalInfo";
import AcademicInfo from "./components/AcademicInfo";
import House from "./components/House";
import Uploads from "./components/Uploads";
import Submit from "./components/Submit";
import AdmissionDocuments from "./components/AdmissionDocuments";
import GuardianInfo from "./components/GuardianInfo";
import AdditionalInfo from "./components/AdditionalInfo";
import Footer from "../../components/Footer";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Loader2 } from "lucide-react";
import { uploadToCloudinary } from ".././utils/cloudinary";
import "./dashboard.css";

console.log("Dashboard file is being processed");

export interface ApplicantData {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: string;
  residence: string;
  programme: string;
  nhisNo: string;
  houseAssigned: string;
  passportPhoto: string;
  phoneNumber: string;
  guardianInfo: GuardianData;
  additionalInfo: AdditionalInfoData;
  academicInfo: AcademicData;
  uploads: UploadStatus;
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

export interface UploadStatus {
  placementForm: string;
  nhisCard: string;
  idDocument: string;
  medicalRecords: string;
}

export default function Dashboard() {
  console.log("Dashboard component is rendering");

  const [applicantData, setApplicantData] = useState<ApplicantData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<keyof UploadStatus, boolean>>(
    {
      placementForm: false,
      nhisCard: false,
      idDocument: false,
      medicalRecords: false,
    }
  );
  const [isUploading, setIsUploading] = useState<
    Record<keyof UploadStatus, boolean>
  >({
    placementForm: false,
    nhisCard: false,
    idDocument: false,
    medicalRecords: false,
  });
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard: useEffect is running");
    const fetchApplicantData = async () => {
      console.log("Dashboard: Attempting to fetch applicant data");
      setIsLoading(true);
      setError(null);

      try {
        console.log("Dashboard: Calling /api/applicant-data");
        const response = await fetch("/api/applicant-data", {
          credentials: "include",
        });

        console.log("Dashboard: Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Dashboard: Error response:", errorData);
          if (response.status === 401) {
            console.log("Dashboard: Unauthorized, redirecting to login");
            router.push("/");
            return;
          }
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Dashboard: Fetched applicant data:", data);

        if (data && Object.keys(data).length > 0) {
          if (!data.uploads) {
            data.uploads = {
              placementForm: "",
              nhisCard: "",
              idDocument: "",
              medicalRecords: "",
            };
          }
          setApplicantData(data);
          // Update uploaded state based on fetched data
          setUploaded({
            placementForm: !!data.uploads.placementForm,
            nhisCard: !!data.uploads.nhisCard,
            idDocument: !!data.uploads.idDocument,
            medicalRecords: !!data.uploads.medicalRecords,
          });
        } else {
          throw new Error("No applicant data found");
        }
      } catch (error) {
        console.error("Dashboard: Error fetching applicant data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch applicant data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicantData();
  }, [router]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: keyof UploadStatus
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading((prev) => ({ ...prev, [documentType]: true }));
      try {
        const uploadPromises = Array.from(files).map((file) =>
          uploadToCloudinary(file)
        );
        const uploadedUrls = await Promise.all(uploadPromises);

        const newStatus = {
          ...applicantData!.uploads,
          [documentType]: uploadedUrls.join(", "),
        };
        setApplicantData((prevData) => ({
          ...prevData!,
          uploads: newStatus,
        }));
        setUploaded((prevUploaded) => ({
          ...prevUploaded,
          [documentType]: true,
        }));
      } catch (error) {
        console.error(`Error uploading ${documentType}:`, error);
        alert(`Failed to upload ${documentType}. Please try again.`);
        setApplicantData((prevData) => ({
          ...prevData!,
          uploads: {
            ...prevData!.uploads,
            [documentType]: "Not uploaded",
          },
        }));
      } finally {
        setIsUploading((prev) => ({ ...prev, [documentType]: false }));
      }
    }
  };

  const handleUploadStatusChange = (newStatus: UploadStatus) => {
    console.log("Dashboard: Updating upload status:", newStatus);
    setApplicantData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        uploads: newStatus,
      };
    });
  };

  const handlePersonalInfoChange = (
    field: keyof ApplicantData,
    value: string
  ) => {
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

  console.log(
    "Dashboard: Before rendering, isLoading:",
    isLoading,
    "error:",
    error,
    "applicantData:",
    applicantData
  );

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

  console.log("Dashboard: Rendering main content");

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <TopBar applicantName={applicantData.fullName} />
        <div className="content-area">
          <PersonalInfo
            applicantData={applicantData}
            onChange={handlePersonalInfoChange}
          />
          <GuardianInfo
            guardianInfo={applicantData.guardianInfo}
            onChange={handleGuardianChange}
          />
          <AdditionalInfo
            additionalInfo={applicantData.additionalInfo}
            onChange={handleAdditionalChange}
          />
          <AcademicInfo
            programme={applicantData.programme}
            academicInfo={applicantData.academicInfo}
            setAcademicData={handleAcademicChange}
          />
          <House
            gender={applicantData.gender}
            houseAssigned={applicantData.houseAssigned}
          />

          <Uploads
            uploadStatus={applicantData.uploads || {}}
            setUploadStatus={(newStatus) => {
              setApplicantData((prevData) => ({
                ...prevData!,
                uploads: newStatus,
              }));
            }}
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
          />
          <AdmissionDocuments />
        </div>
        <Footer />
      </div>
    </div>
  );
}
