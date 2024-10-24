import { useState } from "react";
import Image from "next/image";

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
}
interface PersonalInfoProps {
  applicantData: ApplicantData;
  setApplicantData: React.Dispatch<React.SetStateAction<ApplicantData>>;
}

export default function PersonalInfo({
  applicantData,
  setApplicantData,
}: PersonalInfoProps) {
  const [passportPhoto, setPassportPhoto] = useState<string>("/user.png");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setApplicantData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePassportUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) setPassportPhoto(e.target.result as string);
      };
      reader.readAsDataURL(file);
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
            onChange={handleChange}
            type="text"
            id="fullName"
            name="fullName" // Ensure the name is set
            value={applicantData.fullName}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="indexNumber">
            Index Number <span className="required">*</span>
          </label>
          <input
            onChange={handleChange}
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
          <select
            id="gender"
            name="gender"
            value={applicantData.gender}
            onChange={handleChange}
            disabled
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="aggregate">
            Aggregate <span className="required">*</span>
          </label>
          <input
            onChange={handleChange}
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
          <select
            id="residence"
            name="residence"
            value={applicantData.residence}
            onChange={handleChange}
            disabled
          >
            <option value="">Select Residence</option>
            <option value="boarding">Boarding</option>
            <option value="day">Day</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="programme">
            Programme <span className="required">*</span>
          </label>
          <input
            onChange={handleChange}
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
          />
          <Image
            src={passportPhoto}
            alt="Passport Photo Preview"
            width={100}
            height={100}
            className="passport-preview"
          />
          <label htmlFor="passportUpload" className="upload-button">
            Upload
          </label>
        </div>
      </div>
    </div>
  );
}
