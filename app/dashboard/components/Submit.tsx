import { useState } from "react";

interface ApplicantData {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: string;
  residence: string;
  programme: string;
  nhisNo: string;
  passportPhoto: string; // Ensure this field exists
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
  applicantData: ApplicantData; // Accept applicant data as props
  guardianData: GuardianData; // Accept guardian data as props
  additionalData: AdditionalInfoData; // Accept additional info data as props
  academicData: AcademicData; // Accept academic data as props
  houseData: {
    gender: string;
    houseAssigned: string;
  }; // Accept house data as props
  uploadStatus: UploadStatus; // Accept upload status as props
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
  const [isPending, setIsPending] = useState(false); // Track submission status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true); // Set to pending when submitting

    // Prepare the candidate data to be sent
    const candidateData = {
      applicant: {
        ...applicantData,
        uploads: {
          placementForm: uploadStatus.placementForm,
          nhisCard: uploadStatus.nhisCard,
          idDocument: uploadStatus.idDocument,
          medicalRecords: uploadStatus.medicalRecords,
        },
      },
      guardian: guardianData,
      additionalInfo: additionalData,
      academic: academicData,
      house: houseData,
    };
    console.log(candidateData);
    try {
      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      });

      if (response.ok) {
        setSubmissionMessage("Application submitted successfully!");
      } else {
        setSubmissionMessage("Failed to submit application.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionMessage("An error occurred during submission.");
    } finally {
      setIsPending(false); // Reset pending state after submission
    }
  };

  return (
    <div id="submit" className="section action-section">
      <h2>Submit Application</h2>
      <p className="subtitle headings">
        Review your information before submitting!
      </p>
      {submissionMessage && (
        <p id="applicationStatus" className="application-status">
          Application Status:{" "}
          {submissionMessage === "Application submitted successfully!"
            ? "SUBMITTED"
            : isPending
            ? "PENDING"
            : "FAILED"}
        </p>
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
              <span>
                I declare that all the information provided is true and correct
              </span>
            </div>
          </label>
        </div>

        <div className="">
          <button
            type="submit"
            className="upload-button submit-btn"
            disabled={!isDeclarationChecked || isPending} // Disable button during pending state
          >
            Submit Application
          </button>
        </div>
      </form>
      {submissionMessage && (
        <p className="submission-message">{submissionMessage}</p>
      )}
    </div>
  );
}
