"use client";

import { useState, useEffect } from "react";
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
import "./dashboard.css";

// Define your interfaces
interface ApplicantData {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: string;
  residence: string;
  programme: string;
  nhisNo: string;
  houseAssigned: string;
  passportPhoto: string; // Assuming this is required
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
  coreSubjects: string[]; // Added core subjects if needed
  electiveSubjects: string[];
}

interface UploadStatus {
  placementForm: string;
  nhisCard: string;
  idDocument: string;
  medicalRecords: string;
}

export default function Dashboard() {
  const [applicantData, setApplicantData] = useState<ApplicantData>({
    fullName: "",
    indexNumber: "",
    gender: "",
    aggregate: "",
    residence: "",
    programme: "",
    nhisNo: "",
    houseAssigned: "",
    passportPhoto: "", // Ensure this is initialized
  });

  const [guardianData, setGuardianData] = useState<GuardianData>({
    guardianName: "",
    relationship: "",
    phoneNumber: "",
    whatsappNumber: "",
    email: "",
  });

  const [additionalData, setAdditionalData] = useState<AdditionalInfoData>({
    presentAddress: "",
    nationality: "",
    homeTown: "",
    religion: "",
    previousSchool: "",
    beceYear: "",
  });

  const [academicData, setAcademicData] = useState<AcademicData>({
    selectedClass: "",
    classCapacity: "",
    coreSubjects: [], // Initialize if necessary
    electiveSubjects: [],
  });

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    placementForm: "Not uploaded",
    nhisCard: "Not uploaded",
    idDocument: "Not uploaded",
    medicalRecords: "Not uploaded",
  });

  useEffect(() => {
    // Simulated data fetching
    setApplicantData({
      fullName: "TAMAKLOE GERTRUDE EDINAM",
      indexNumber: "12345678",
      gender: "Female",
      aggregate: "10",
      residence: "boarding",
      programme: "General Science",
      nhisNo: "NHS123456789",
      houseAssigned: "House 1",
      passportPhoto: "", // Ensure this is updated or initialized
    });

    setGuardianData({
      guardianName: "",
      relationship: "Parent",
      phoneNumber: "",
      whatsappNumber: "",
      email: "",
    });

    setAdditionalData({
      presentAddress: "",
      nationality: "Ghanaian",
      homeTown: "",
      religion: "",
      previousSchool: "",
      beceYear: "",
    });

    // Reset upload status if necessary
    setUploadStatus({
      placementForm: "Not uploaded",
      nhisCard: "Not uploaded",
      idDocument: "Not uploaded",
      medicalRecords: "Not uploaded",
    });
  }, []);

  // Handler to update additional data
  const handleAdditionalChange = (
    field: keyof AdditionalInfoData,
    value: string
  ) => {
    setAdditionalData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Handler to update guardian data
  const handleGuardianChange = (field: keyof GuardianData, value: string) => {
    setGuardianData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Handler to update academic data
  const handleAcademicChange = (field: keyof AcademicData, value: string) => {
    setAcademicData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <TopBar applicantName={applicantData.fullName} />
        <div className="content-area">
          <PersonalInfo
            applicantData={applicantData}
            setApplicantData={setApplicantData} // Ensure this is correct
          />
          <GuardianInfo
            guardianInfo={guardianData}
            onChange={handleGuardianChange} // Correctly reference the handler
          />
          <AdditionalInfo
            additionalInfo={additionalData}
            onChange={handleAdditionalChange} // Correctly reference the handler
          />
          <AcademicInfo
            programme={applicantData.programme}
            setAcademicData={setAcademicData} // Ensure this matches expected types
          />
          <House
            gender={applicantData.gender}
            houseAssigned={applicantData.houseAssigned}
          />
          <Uploads
            uploadStatus={uploadStatus}
            setUploadStatus={setUploadStatus}
          />
          <Submit
            applicantData={applicantData}
            guardianData={guardianData}
            additionalData={additionalData}
            academicData={academicData}
            houseData={{
              gender: applicantData.gender,
              houseAssigned: applicantData.houseAssigned,
            }}
            uploadStatus={uploadStatus} // Pass upload status to Submit
          />
          <AdmissionDocuments />
        </div>
        <Footer />
      </div>
    </div>
  );
}
