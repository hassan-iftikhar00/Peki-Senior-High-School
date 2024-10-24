import { useState } from "react";

interface AdditionalInfoData {
  presentAddress: string;
  nationality: string;
  homeTown: string;
  religion: string;
  previousSchool: string;
  beceYear: string;
}

interface AdditionalInfoProps {
  additionalInfo: AdditionalInfoData;
  onChange: (field: keyof AdditionalInfoData, value: string) => void;
}

export default function AdditionalInfo({
  additionalInfo,
  onChange,
}: AdditionalInfoProps) {
  return (
    <div className="section">
      <h2>Additional Information</h2>
      <form className="form-grid">
        <div className="form-group">
          <label htmlFor="presentAddress">
            Present Address <span className="required">*</span>
          </label>
          <textarea
            id="presentAddress"
            value={additionalInfo.presentAddress}
            onChange={(e) => onChange("presentAddress", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nationality">
            Nationality <span className="required">*</span>
          </label>
          <select
            id="nationality"
            value={additionalInfo.nationality}
            onChange={(e) => onChange("nationality", e.target.value)}
            required
          >
            <option value="">Select Nationality</option>
            <option value="ghanaian">Ghanaian</option>
            <option value="nigerian">Nigerian</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="homeTown">
            Home Town <span className="required">*</span>
          </label>
          <input
            type="text"
            id="homeTown"
            value={additionalInfo.homeTown}
            onChange={(e) => onChange("homeTown", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="religion">
            Religion <span className="required">*</span>
          </label>
          <select
            id="religion"
            value={additionalInfo.religion}
            onChange={(e) => onChange("religion", e.target.value)}
            required
          >
            <option value="">Select Religion</option>
            <option value="christianity">Christianity</option>
            <option value="islam">Islam</option>
            <option value="traditional">Traditional</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="previousSchool">
            Previous School <span className="required">*</span>
          </label>
          <input
            type="text"
            id="previousSchool"
            value={additionalInfo.previousSchool}
            onChange={(e) => onChange("previousSchool", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="beceYear">
            BECE Year <span className="required">*</span>
          </label>
          <select
            id="beceYear"
            value={additionalInfo.beceYear}
            onChange={(e) => onChange("beceYear", e.target.value)}
            required
          >
            <option value="">Select BECE Year</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>
      </form>
    </div>
  );
}
