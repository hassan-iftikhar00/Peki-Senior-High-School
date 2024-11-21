"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import "./dashboard.css";
import { UploadStatus } from "./components/Uploads";

// Dynamically import components
const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });
const TopBar = dynamic(() => import("./components/TopBar"), { ssr: false });
const PersonalInfo = dynamic(() => import("./components/PersonalInfo"));
const AcademicInfo = dynamic(() => import("./components/AcademicInfo"));
const House = dynamic(() => import("./components/House"));
const Uploads = dynamic(() => import("./components/Uploads"));
const Submit = dynamic(() => import("./components/Submit"));
const AdmissionDocuments = dynamic(
  () => import("./components/AdmissionDocuments")
);
const GuardianInfo = dynamic(() => import("./components/GuardianInfo"));
const AdditionalInfo = dynamic(() => import("./components/AdditionalInfo"));
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

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
  feePaid: boolean;
  houseId: string;
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

const STORAGE_KEY = "applicationFormData";

export default function Dashboard() {
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAssigningHouse, setIsAssigningHouse] = useState(false);
  const [isHouseAssignmentPending, setIsHouseAssignmentPending] =
    useState(false);
  const router = useRouter();

  const fetchApplicantData = useCallback(async () => {
    if (!isLoading) return;

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setApplicantData(parsedData);
        setIsSubmitted(!!parsedData.applicationNumber);
        setIsEditMode(!parsedData.applicationNumber);
        setIsLoading(false);
        return;
      }

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
        const formattedData = {
          ...data,
          uploads: data.uploads || {
            placementForm: [],
            nhisCard: null,
            idDocument: null,
            medicalRecords: [],
          },
        };
        setApplicantData(formattedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedData));
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
  }, [router]);

  useEffect(() => {
    fetchApplicantData();
  }, [fetchApplicantData]);

  useEffect(() => {
    if (applicantData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applicantData));
    }
  }, [applicantData]);

  const assignHouse = useCallback(
    async (gender: string, indexNumber: string) => {
      if (isAssigningHouse) return null;
      setIsAssigningHouse(true);
      try {
        const response = await fetch("/api/assign-house", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gender, indexNumber }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to assign house");
        }

        console.log("House assigned:", data);
        return data;
      } catch (error) {
        console.error("Error assigning house:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to assign house. Please try again later."
        );
        return null;
      } finally {
        setIsAssigningHouse(false);
      }
    },
    [isAssigningHouse]
  );

  useEffect(() => {
    if (
      applicantData &&
      (!applicantData.houseAssigned ||
        applicantData.houseAssigned === "Not Assigned") &&
      !isAssigningHouse &&
      !isHouseAssignmentPending
    ) {
      setIsHouseAssignmentPending(true);
      assignHouse(applicantData.gender, applicantData.indexNumber)
        .then((houseData) => {
          if (houseData) {
            setApplicantData((prevData) =>
              prevData
                ? {
                    ...prevData,
                    houseId: houseData.houseId,
                    houseAssigned: houseData.houseName,
                  }
                : null
            );
            console.log("Updated applicant data with house:", {
              houseId: houseData.houseId,
              houseAssigned: houseData.houseName,
            });
            updateApplicantHouse(houseData.houseId, houseData.houseName);
          }
        })
        .finally(() => {
          setIsHouseAssignmentPending(false);
        });
    }
  }, [applicantData, assignHouse, isAssigningHouse, isHouseAssignmentPending]);

  const updateApplicantHouse = async (houseId: string, houseName: string) => {
    try {
      const response = await fetch("/api/update-applicant-house", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indexNumber: applicantData?.indexNumber,
          houseId,
          houseName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update applicant house in the database");
      }

      console.log("Applicant house updated in the database");
    } catch (error) {
      console.error("Error updating applicant house:", error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem(STORAGE_KEY);
      await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.setItem("isLoggedIn", "true");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!applicantData) return;

    setIsLoading(true);
    try {
      if (!applicantData.houseId) {
        const houseData = await assignHouse(
          applicantData.gender,
          applicantData.indexNumber
        );
        if (houseData) {
          setApplicantData((prevData) => ({
            ...prevData!,
            houseId: houseData.houseId,
            houseAssigned: houseData.houseName,
          }));
        } else {
          throw new Error("Failed to assign house");
        }
      }

      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicantData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      const result = await response.json();
      setApplicantData(result.candidate);
      setIsSubmitted(true);
      setIsEditMode(false);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Submission error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during submission"
      );
    } finally {
      setIsLoading(false);
    }
  }, [applicantData, assignHouse]);

  const handlePersonalInfoChange = useCallback(
    (field: keyof ApplicantData, value: string) => {
      if (isSubmitted && !isEditMode) return;
      setApplicantData((prevData) => {
        if (!prevData) return null;
        return { ...prevData, [field]: value };
      });
    },
    [isSubmitted, isEditMode]
  );

  const handleGuardianChange = useCallback(
    (field: keyof GuardianData, value: string) => {
      if (isSubmitted && !isEditMode) return;
      setApplicantData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          guardianInfo: { ...prevData.guardianInfo, [field]: value },
        };
      });
    },
    [isSubmitted, isEditMode]
  );

  const handleAdditionalChange = useCallback(
    (field: keyof AdditionalInfoData, value: string) => {
      if (isSubmitted && !isEditMode) return;
      setApplicantData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          additionalInfo: { ...prevData.additionalInfo, [field]: value },
        };
      });
    },
    [isSubmitted, isEditMode]
  );

  const handleAcademicInfoChange = useCallback(
    (newAcademicInfo: AcademicData) => {
      if (isSubmitted && !isEditMode) return;
      setApplicantData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          academicInfo: newAcademicInfo,
        };
      });
    },
    [isSubmitted, isEditMode]
  );

  const handleUploadStatusChange = useCallback(
    (newUploadStatus: UploadStatus) => {
      if (isSubmitted && !isEditMode) return;
      setApplicantData((prevData) =>
        prevData ? { ...prevData, uploads: newUploadStatus } : null
      );
    },
    [isSubmitted, isEditMode]
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
          onClick={handleLogout}
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
        <Suspense fallback={<div>Loading...</div>}>
          <div style={{ width: "280px" }}>
            <Sidebar />
          </div>
          <div style={{ flex: 1 }}>
            <TopBar
              applicantName={applicantData.fullName}
              passportPhoto={applicantData.passportPhoto}
            />
          </div>
        </Suspense>
      </div>
      <div
        className="main-content"
        style={{ flex: 1, overflow: "auto", marginLeft: "280px" }}
      >
        <div className="content-area">
          <Suspense fallback={<div>Loading...</div>}>
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
              onAcademicInfoChange={handleAcademicInfoChange}
              isEditMode={isEditMode}
            />
            <House
              gender={applicantData.gender}
              houseId={applicantData.houseId}
              houseName={applicantData.houseAssigned}
              isLoading={isAssigningHouse}
              error={error}
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
                houseId: applicantData.houseId,
              }}
              uploadStatus={applicantData.uploads}
              onSubmit={handleSubmit}
              onEdit={() => setIsEditMode(true)}
              onSave={() => setIsEditMode(false)}
              isSubmitted={isSubmitted}
              isEditMode={isEditMode}
            />
            <AdmissionDocuments candidateData={applicantData} />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// const STORAGE_KEY = "applicationFormData";

// export default function Dashboard() {
//   const [applicantData, setApplicantData] = useState<ApplicantData | null>(
//     null
//   );
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isAssigningHouse, setIsAssigningHouse] = useState(false);
//   const [isHouseAssignmentPending, setIsHouseAssignmentPending] =
//     useState(false);
//   const router = useRouter();

//   const fetchApplicantData = useCallback(async () => {
//     if (!isLoading) return;

//     try {
//       const response = await fetch("/api/applicant-data", {
//         credentials: "include",
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         if (response.status === 401) {
//           router.push("/");
//           return;
//         }
//         throw new Error(
//           errorData.error || `HTTP error! status: ${response.status}`
//         );
//       }

//       const data = await response.json();

//       if (data && Object.keys(data).length > 0) {
//         setApplicantData({
//           ...data,
//           uploads: data.uploads || {
//             placementForm: [],
//             nhisCard: null,
//             idDocument: null,
//             medicalRecords: [],
//           },
//         });
//         const wasSubmitted = !!data.applicationNumber;
//         setIsSubmitted(wasSubmitted);
//         setIsEditMode(!wasSubmitted);
//       } else {
//         throw new Error("No applicant data found");
//       }
//     } catch (error) {
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch applicant data"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, [router]);

//   useEffect(() => {
//     fetchApplicantData();
//   }, [fetchApplicantData]);

//   const assignHouse = useCallback(
//     async (gender: string, indexNumber: string) => {
//       if (isAssigningHouse) return null;
//       setIsAssigningHouse(true);
//       try {
//         const response = await fetch("/api/assign-house", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ gender, indexNumber }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || "Failed to assign house");
//         }

//         console.log("House assigned:", data);
//         return data;
//       } catch (error) {
//         console.error("Error assigning house:", error);
//         setError(
//           error instanceof Error
//             ? error.message
//             : "Failed to assign house. Please try again later."
//         );
//         return null;
//       } finally {
//         setIsAssigningHouse(false);
//       }
//     },
//     [isAssigningHouse]
//   );

//   useEffect(() => {
//     if (
//       applicantData &&
//       (!applicantData.houseAssigned ||
//         applicantData.houseAssigned === "Not Assigned") &&
//       !isAssigningHouse &&
//       !isHouseAssignmentPending
//     ) {
//       setIsHouseAssignmentPending(true);
//       assignHouse(applicantData.gender, applicantData.indexNumber)
//         .then((houseData) => {
//           if (houseData) {
//             setApplicantData((prevData) =>
//               prevData
//                 ? {
//                     ...prevData,
//                     houseId: houseData.houseId,
//                     houseAssigned: houseData.houseName,
//                   }
//                 : null
//             );
//             console.log("Updated applicant data with house:", {
//               houseId: houseData.houseId,
//               houseAssigned: houseData.houseName,
//             });
//             // Update the backend with the new house assignment
//             updateApplicantHouse(houseData.houseId, houseData.houseName);
//           }
//         })
//         .finally(() => {
//           setIsHouseAssignmentPending(false);
//         });
//     }
//   }, [applicantData, assignHouse, isAssigningHouse, isHouseAssignmentPending]);

//   const updateApplicantHouse = async (houseId: string, houseName: string) => {
//     try {
//       const response = await fetch("/api/update-applicant-house", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           indexNumber: applicantData?.indexNumber,
//           houseId,
//           houseName,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update applicant house in the database");
//       }

//       console.log("Applicant house updated in the database");
//     } catch (error) {
//       console.error("Error updating applicant house:", error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       localStorage.setItem("isLoggedIn", "false");
//       await fetch("/api/logout", {
//         method: "POST",
//         credentials: "same-origin",
//       });
//       router.push("/");
//     } catch (error) {
//       console.error("Logout failed:", error);
//       localStorage.setItem("isLoggedIn", "true"); // Revert on error
//       // Optionally, notify the user of the error
//     } finally {
//     }
//   };

//   const handleSubmit = useCallback(async () => {
//     if (!applicantData) return;

//     setIsLoading(true);
//     try {
//       // Ensure house is assigned before submission
//       if (!applicantData.houseId) {
//         const houseData = await assignHouse(
//           applicantData.gender,
//           applicantData.indexNumber
//         );
//         if (houseData) {
//           setApplicantData((prevData) => ({
//             ...prevData!,
//             houseId: houseData.houseId,
//             houseAssigned: houseData.houseName,
//           }));
//         } else {
//           throw new Error("Failed to assign house");
//         }
//       }

//       // Submit the data to the server
//       const response = await fetch("/api/candidate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(applicantData),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to submit application");
//       }

//       const result = await response.json();
//       setApplicantData(result.candidate);
//       setIsSubmitted(true);
//       setIsEditMode(false);
//     } catch (error) {
//       console.error("Submission error:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "An error occurred during submission"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, [applicantData, assignHouse]);

//   const handlePersonalInfoChange = useCallback(
//     (field: keyof ApplicantData, value: string) => {
//       if (isSubmitted && !isEditMode) return;
//       setApplicantData((prevData) => {
//         if (!prevData) return null;
//         return { ...prevData, [field]: value };
//       });
//     },
//     [isSubmitted, isEditMode]
//   );

//   const handleGuardianChange = useCallback(
//     (field: keyof GuardianData, value: string) => {
//       if (isSubmitted && !isEditMode) return;
//       setApplicantData((prevData) => {
//         if (!prevData) return null;
//         return {
//           ...prevData,
//           guardianInfo: { ...prevData.guardianInfo, [field]: value },
//         };
//       });
//     },
//     [isSubmitted, isEditMode]
//   );

//   const handleAdditionalChange = useCallback(
//     (field: keyof AdditionalInfoData, value: string) => {
//       if (isSubmitted && !isEditMode) return;
//       setApplicantData((prevData) => {
//         if (!prevData) return null;
//         return {
//           ...prevData,
//           additionalInfo: { ...prevData.additionalInfo, [field]: value },
//         };
//       });
//     },
//     [isSubmitted, isEditMode]
//   );

//   const handleAcademicInfoChange = useCallback(
//     (newAcademicInfo: AcademicData) => {
//       if (isSubmitted && !isEditMode) return;
//       setApplicantData((prevData) => {
//         if (!prevData) return null;
//         return {
//           ...prevData,
//           academicInfo: newAcademicInfo,
//         };
//       });
//     },
//     [isSubmitted, isEditMode]
//   );

//   const handleUploadStatusChange = useCallback(
//     (newUploadStatus: UploadStatus) => {
//       if (isSubmitted && !isEditMode) return;
//       setApplicantData((prevData) =>
//         prevData ? { ...prevData, uploads: newUploadStatus } : null
//       );
//     },
//     [isSubmitted, isEditMode]
//   );

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="mr-2 h-16 w-16 animate-spin" />
//         <span className="text-xl font-semibold">Loading...</span>
//       </div>
//     );
//   }

//   if (error || !applicantData) {
//     return (
//       <div className="container mx-auto p-4">
//         <Alert variant="destructive">
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>
//             {error ||
//               "Failed to load applicant data. Please try refreshing the page or contact support if the problem persists."}
//           </AlertDescription>
//         </Alert>
//         <button
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           onClick={handleLogout}
//         >
//           Return to Login
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="dashboard-container"
//       style={{ display: "flex", flexDirection: "column", height: "100vh" }}
//     >
//       <div style={{ display: "flex", width: "100%" }}>
//         <Suspense fallback={<div>Loading...</div>}>
//           <div style={{ width: "280px" }}>
//             <Sidebar />
//           </div>
//           <div style={{ flex: 1 }}>
//             <TopBar
//               applicantName={applicantData.fullName}
//               passportPhoto={applicantData.passportPhoto}
//             />
//           </div>
//         </Suspense>
//       </div>
//       <div
//         className="main-content"
//         style={{ flex: 1, overflow: "auto", marginLeft: "280px" }}
//       >
//         <div className="content-area">
//           <Suspense fallback={<div>Loading...</div>}>
//             <PersonalInfo
//               applicantData={applicantData}
//               onChange={handlePersonalInfoChange}
//               isDisabled={isSubmitted && !isEditMode}
//             />
//             <GuardianInfo
//               guardianInfo={applicantData.guardianInfo}
//               onChange={handleGuardianChange}
//               isDisabled={isSubmitted && !isEditMode}
//             />
//             <AdditionalInfo
//               additionalInfo={applicantData.additionalInfo}
//               onChange={handleAdditionalChange}
//               isDisabled={isSubmitted && !isEditMode}
//             />
//             <AcademicInfo
//               programme={applicantData.programme}
//               academicInfo={applicantData.academicInfo}
//               onAcademicInfoChange={handleAcademicInfoChange}
//               isEditMode={isEditMode}
//             />
//             <House
//               gender={applicantData.gender}
//               houseId={applicantData.houseId}
//               houseName={applicantData.houseAssigned}
//               isLoading={isAssigningHouse}
//               error={error}
//             />
//             <Uploads
//               initialUploadStatus={applicantData.uploads}
//               onUploadStatusChange={handleUploadStatusChange}
//               isDisabled={isSubmitted && !isEditMode}
//             />
//             <Submit
//               applicantData={applicantData}
//               guardianData={applicantData.guardianInfo}
//               additionalData={applicantData.additionalInfo}
//               academicData={applicantData.academicInfo}
//               houseData={{
//                 gender: applicantData.gender,
//                 houseAssigned: applicantData.houseAssigned,
//                 houseId: applicantData.houseId,
//               }}
//               uploadStatus={applicantData.uploads}
//               onSubmit={handleSubmit}
//               onEdit={() => setIsEditMode(true)}
//               onSave={() => setIsEditMode(false)}
//               isSubmitted={isSubmitted}
//               isEditMode={isEditMode}
//             />
//             <AdmissionDocuments candidateData={applicantData} />
//           </Suspense>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }
