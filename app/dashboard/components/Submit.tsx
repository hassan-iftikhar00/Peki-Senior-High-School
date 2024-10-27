import { useState } from "react";

interface ApplicantData {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: string;
  residence: string;
  programme: string;
  nhisNo: string;
  passportPhoto: string;
  phoneNumber?: string;
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
  placementForm: string;
  nhisCard: string;
  idDocument: string;
  medicalRecords: string;
}

interface SubmitProps {
  applicantData: ApplicantData;
  guardianData: GuardianData;
  additionalData: AdditionalInfoData;
  academicData: AcademicData;
  houseData: {
    gender: string;
    houseAssigned: string;
  };
  uploadStatus: UploadStatus;
}

export default function Submit({
  applicantData,
  guardianData,
  additionalData,
  academicData,
  houseData,
  uploadStatus,
}: SubmitProps) {
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<
    "PENDING" | "SUBMITTED" | "FAILED"
  >("PENDING");
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const validateRequiredFields = () => {
    const newErrors: string[] = [];

    // Check ApplicantData
    if (!applicantData.nhisNo) newErrors.push("NHIS Number is required");
    if (!applicantData.passportPhoto)
      newErrors.push("Passport Photo is required");

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

    // Check AcademicData
    if (!academicData.selectedClass)
      newErrors.push("Class selection is required");
    if (academicData.electiveSubjects.length === 0)
      newErrors.push("At least one elective subject is required");

    // Check UploadStatus
    if (uploadStatus.placementForm === "Not uploaded")
      newErrors.push("Placement Form is required");
    if (uploadStatus.nhisCard === "Not uploaded")
      newErrors.push("NHIS Card is required");
    if (uploadStatus.idDocument === "Not uploaded")
      newErrors.push("ID Document is required");

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setIsPending(true);
    setErrors([]);
    setSubmissionStatus("PENDING");

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

    const candidateData = {
      fullName: applicantData.fullName,
      indexNumber: applicantData.indexNumber,
      gender: applicantData.gender,
      aggregate: applicantData.aggregate,
      residence: applicantData.residence,
      programme: applicantData.programme,
      nhisNo: applicantData.nhisNo,
      passportPhoto: applicantData.passportPhoto,
      phoneNumber: applicantData.phoneNumber || "",
      guardianInfo: guardianData,
      additionalInfo: additionalData,
      academicInfo: {
        ...academicData,
        classCapacity: parseInt(academicData.classCapacity) || 0,
      },
      house: houseData,
      uploads: uploadStatus,
    };

    console.log(
      "Submitting candidate data:",
      JSON.stringify(candidateData, null, 2)
    );

    try {
      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissionMessage(data.message);
        setSubmissionStatus("SUBMITTED");
      } else {
        setSubmissionMessage(`Failed to submit application: ${data.error}`);
        setSubmissionStatus("FAILED");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionMessage("An error occurred during submission.");
      setSubmissionStatus("FAILED");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div id="submit" className="section action-section">
      <h2>Submit Application</h2>
      <p className="subtitle headings">
        Review your information before submitting!
      </p>
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

        <div className="">
          <button
            type="submit"
            className="upload-button submit-btn"
            disabled={isPending}
          >
            {isPending ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
