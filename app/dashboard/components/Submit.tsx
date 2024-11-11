import React, { useEffect, useState } from "react";
import { UploadStatus } from "./Uploads";
import { Loader2 } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";

interface ApplicantData {
  fullName: string;
  indexNumber: string;
  gender: string;
  houseAssigned: string;
  aggregate: string;
  residence: string;
  programme: string;
  nhisNo: string;
  enrollmentCode: string;
  passportPhoto: string;
  phoneNumber?: string;
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

interface SubmitProps {
  applicantData: ApplicantData;
  guardianData: GuardianData;
  additionalData: AdditionalInfoData;
  academicData: AcademicData;
  houseData: {
    gender: string;
    houseAssigned: string;
    houseId: string;
  };
  uploadStatus: UploadStatus;
  onSubmit: () => void;
  onEdit: () => void;
  onSave: () => void;
  isSubmitted: boolean;
  isEditMode: boolean;
}

export default function Submit({
  applicantData,
  guardianData,
  additionalData,
  academicData,
  houseData,
  uploadStatus,
  onSubmit,
  onEdit,
  onSave,
  isSubmitted,
  isEditMode,
}: SubmitProps) {
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<
    "PENDING" | "SUBMITTED" | "FAILED"
  >("PENDING");
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [position, setPosition] = useState(0);
  useEffect(() => {
    if (isSubmitted) {
      setSubmissionStatus("SUBMITTED");
      if (applicantData.applicationNumber) {
        setApplicationNumber(applicantData.applicationNumber);
      }
    } else {
      fetchApplicationNumber();
    }
  }, [isSubmitted, applicantData.applicationNumber]);

  const fetchApplicationNumber = async () => {
    setIsGeneratingNumber(true);
    try {
      const response = await fetch("/api/get-application-number");
      if (!response.ok) throw new Error("Failed to get application number");
      const data = await response.json();
      if (data.applicationNumber && data.position) {
        setApplicationNumber(data.applicationNumber);
        setPosition(data.position);
      } else {
        throw new Error("No application number or position received");
      }
    } catch (error) {
      console.error("Error getting application number:", error);
      setErrors((prev) => [...prev, "Failed to generate application number"]);
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  // const generateApplicationNumber = async (): Promise<boolean> => {
  //   setIsGeneratingNumber(true);
  //   try {
  //     const response = await fetch("/api/get-application-number");
  //     if (!response.ok) throw new Error("Failed to get application number");
  //     const data = await response.json();
  //     if (data.applicationNumber) {
  //       setApplicationNumber(data.applicationNumber);
  //       return true;
  //     }
  //     throw new Error("No application number received");
  //   } catch (error) {
  //     console.error("Error getting application number:", error);
  //     setErrors((prev) => [...prev, "Failed to generate application number"]);
  //     return false;
  //   } finally {
  //     setIsGeneratingNumber(false);
  //   }
  // };

  const validateRequiredFields = () => {
    const newErrors: string[] = [];

    // Check ApplicantData
    if (!applicantData.nhisNo) newErrors.push("NHIS Number is required");
    if (!applicantData.passportPhoto)
      newErrors.push("Passport Photo is required");
    if (!applicantData.enrollmentCode)
      newErrors.push("Enrollment Code is required");

    // Check GuardianData
    if (!guardianData.guardianName) newErrors.push("Guardian Name is required");
    if (!guardianData.relationship)
      newErrors.push("Guardian Relationship is required");
    if (!guardianData.phoneNumber)
      newErrors.push("Guardian Phone Number is required");

    // Check AdditionalInfoData
    if (!additionalData.presentAddress)
      newErrors.push("Present Address is required");
    if (!additionalData.nationality) newErrors.push("Nationality is required");
    if (!additionalData.homeTown) newErrors.push("Home Town is required");
    if (!additionalData.religion) newErrors.push("Religion is required");
    if (!additionalData.previousSchool)
      newErrors.push("Previous School is required");
    if (!additionalData.beceYear) newErrors.push("BECE Year is required");

    // Check UploadStatus
    if (uploadStatus.placementForm.length === 0)
      newErrors.push("Placement Form is required");
    if (!uploadStatus.nhisCard) newErrors.push("NHIS Card is required");
    if (!uploadStatus.idDocument) newErrors.push("ID Document is required");

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setIsPending(true);
    setErrors([]);
    setSubmissionStatus("PENDING");

    if (!applicationNumber) {
      setErrors(["Application number is not available. Please try again."]);
      setIsPending(false);
      setSubmissionStatus("FAILED");
      return;
    }

    const validationErrors = validateRequiredFields();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsPending(false);
      setSubmissionStatus("FAILED");
      return;
    }

    if (!isDeclarationChecked) {
      setErrors(["Please check the declaration before submitting."]);
      setIsPending(false);
      setSubmissionStatus("FAILED");
      return;
    }

    const formattedUploads = {
      placementForm: uploadStatus.placementForm,
      nhisCard: uploadStatus.nhisCard,
      idDocument: uploadStatus.idDocument,
      medicalRecords: uploadStatus.medicalRecords || [],
    };

    const candidateData = {
      ...applicantData,
      guardianInfo: guardianData,
      additionalInfo: additionalData,
      academicInfo: {
        ...academicData,
        classCapacity: parseInt(academicData.classCapacity) || 0,
      },
      house: houseData,
      uploads: formattedUploads,
      applicationNumber: applicationNumber,
      position: position,
    };

    setLoadingMessage("Submitting your application...");

    try {
      console.log(
        "Submitting candidate data:",
        JSON.stringify(candidateData, null, 2)
      );

      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        setSubmissionMessage(
          `Application submitted successfully! Your application number is: ${applicationNumber}`
        );
        setSubmissionStatus("SUBMITTED");
        onSubmit();
      } else {
        let errorMessage = data.error || "Unknown error occurred";
        if (errorMessage.includes("No available houses")) {
          errorMessage =
            "No available houses. Please contact the administration.";
        }
        setSubmissionMessage(
          `Failed to submit application. Click submit again`
        );
        setSubmissionStatus("FAILED");
        setErrors([errorMessage]);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionMessage("An error occurred during submission.");
      setSubmissionStatus("FAILED");
      setErrors(["An unexpected error occurred. Please try again later."]);
    } finally {
      setLoadingMessage("");
      setIsPending(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsPending(true);
    try {
      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...applicantData,
          guardianInfo: guardianData,
          additionalInfo: additionalData,
          academicInfo: {
            ...academicData,
            classCapacity: parseInt(academicData.classCapacity) || 0,
          },
          house: houseData,
          uploads: uploadStatus,
          applicationNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.applicationNumber !== applicationNumber) {
          setApplicationNumber(data.applicationNumber);
          setPosition(data.position);
        }
        setSubmissionMessage(
          `Application submitted successfully! Your application number is: ${data.applicationNumber}`
        );
        setSubmissionStatus("SUBMITTED");
        onSubmit();
      } else {
        let errorMessage = data.error || "Unknown error occurred";
        if (errorMessage.includes("No available houses")) {
          errorMessage =
            "No available houses. Please contact the administration.";
        }
        setSubmissionMessage(
          `Failed to submit application. Click submit again.`
        );
        setSubmissionStatus("FAILED");
        setErrors([errorMessage]);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionMessage("An error occurred during submission.");
      setSubmissionStatus("FAILED");
      setErrors(["An unexpected error occurred. Please try again later."]);
    } finally {
      setLoadingMessage("");
      setIsPending(false);
    }
  };

  return (
    <div id="submit" className="section action-section">
      <LoadingOverlay isVisible={!!loadingMessage} message={loadingMessage} />
      <h2>Submit Application</h2>
      <p className="subtitle headings">
        Review your information before submitting!
      </p>
      {submissionStatus === "SUBMITTED" && applicationNumber && (
        <div className="application-number-container">
          <p className="application-number">
            Your Application Number: <span>{applicationNumber}</span>
          </p>

          <p className="reference-text">
            Please save this number for future reference
          </p>
        </div>
      )}
      {submissionMessage && (
        <p
          id="applicationStatus"
          className={`application-status ${submissionStatus.toLowerCase()}`}
        >
          Application Status: {submissionStatus}
          <br />
          {submissionMessage}
        </p>
      )}
      {errors.length > 0 && (
        <div className="error-messages">
          <p>Please correct the following errors:</p>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="declaration">
            <div className="check-declaration">
              <input
                type="checkbox"
                id="declaration"
                className="checkbox-decl"
                required
                checked={isDeclarationChecked}
                onChange={(e) => setIsDeclarationChecked(e.target.checked)}
                disabled={submissionStatus === "SUBMITTED" && !isEditMode}
              />
              <span
                className={
                  isFormSubmitted && !isDeclarationChecked ? "text-red-500" : ""
                }
              >
                I declare that all the information provided is true and correct
              </span>
            </div>
          </label>
        </div>

        <div className="mt-6 flex gap-4">
          {submissionStatus === "SUBMITTED" ? (
            isEditMode ? (
              <button
                type="button"
                onClick={handleSaveChanges}
                className="upload-button submit-btn flex-1"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onEdit}
                className="upload-button submit-btn flex-1"
              >
                Edit Application
              </button>
            )
          ) : (
            <button
              type="submit"
              className="upload-button submit-btn flex-1"
              disabled={isPending || isGeneratingNumber}
            >
              {isPending || isGeneratingNumber ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isGeneratingNumber
                    ? "Generating Number..."
                    : "Submitting..."}
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
