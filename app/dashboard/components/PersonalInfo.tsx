import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadToCloudinary } from "@/app/utils/cloudinary";

interface ApplicantData {
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
}

interface PersonalInfoProps {
  applicantData: ApplicantData;
  onChange: (field: keyof ApplicantData, value: string) => void;
}

export default function PersonalInfo({
  applicantData,
  onChange,
}: PersonalInfoProps) {
  const [passportPhoto, setPassportPhoto] = useState<string>(
    applicantData.passportPhoto || "/user.png"
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log("PersonalInfo received applicantData:", applicantData);
    if (applicantData.passportPhoto) {
      setPassportPhoto(applicantData.passportPhoto);
    }
  }, [applicantData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange(name as keyof ApplicantData, value);
  };

  const handlePassportUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const cloudinaryUrl = await uploadToCloudinary(file);
        setPassportPhoto(cloudinaryUrl);
        onChange("passportPhoto", cloudinaryUrl);
      } catch (error) {
        console.error("Error uploading passport photo:", error);
        alert("Failed to upload passport photo. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div id="personal-info" className="section">
      <h2>Personal Information</h2>
      <p className="subtitle headings">
        Please provide your personal details accurately!
      </p>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="fullName">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={applicantData.fullName}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="indexNumber">
            Index Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="indexNumber"
            name="indexNumber"
            value={applicantData.indexNumber}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">
            Gender <span className="required">*</span>
          </label>
          <input
            id="gender"
            name="gender"
            value={applicantData.gender}
            disabled
          />
          {/* <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select> */}
        </div>
        <div className="form-group">
          <label htmlFor="aggregate">
            Aggregate <span className="required">*</span>
          </label>
          <input
            type="text"
            id="aggregate"
            name="aggregate"
            value={applicantData.aggregate}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="residence">
            Residence <span className="required">*</span>
          </label>
          <input
            id="residence"
            name="residence"
            value={applicantData.residence}
            disabled
          />
          {/* <option value="">Select Residence</option>
            <option value="boarding">Boarding</option>
            <option value="day">Day</option>
          </select> */}
        </div>
        <div className="form-group">
          <label htmlFor="programme">
            Programme <span className="required">*</span>
          </label>
          <input
            type="text"
            id="programme"
            name="programme"
            value={applicantData.programme}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="nhisNo">
            NHIS No <span className="required">*</span>
          </label>
          <input
            onChange={handleChange}
            type="text"
            id="nhisNo"
            name="nhisNo"
            value={applicantData.nhisNo}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">
            Phone Number <span className="required">*</span>
          </label>
          <input
            onChange={handleChange}
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={applicantData.phoneNumber}
            required
          />
        </div>
        <div className="passport-photo">
          <label htmlFor="passportUpload">
            Passport Photo <span className="required">*</span>
          </label>
          <input
            type="file"
            id="passportUpload"
            accept="image/*"
            onChange={handlePassportUpload}
            required
            className="hidden"
            disabled={isUploading}
          />
          <Image
            src={passportPhoto}
            alt="Passport Photo Preview"
            width={100}
            height={100}
            className="passport-preview"
          />
          <label
            htmlFor="passportUpload"
            className={`upload-button ${isUploading ? "disabled" : ""}`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </label>
        </div>
      </div>
    </div>
  );
}
