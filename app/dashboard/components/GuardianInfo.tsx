import { useState } from "react";

interface GuardianData {
  guardianName: string;
  relationship: string;
  phoneNumber: string;
  whatsappNumber?: string;
  email?: string;
}

interface GuardianInfoProps {
  guardianInfo: GuardianData;
  onChange: (field: keyof GuardianData, value: string) => void;
}

export default function GuardianInfo({
  guardianInfo,
  onChange,
}: GuardianInfoProps) {
  return (
    <div className="section">
      <h2>Guardian Information</h2>
      <form className="form-grid">
        <div className="form-group">
          <label htmlFor="guardianName">
            Guardian Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="guardianName"
            value={guardianInfo.guardianName}
            onChange={(e) => onChange("guardianName", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="relationship">
            Relationship <span className="required">*</span>
          </label>
          <select
            id="relationship"
            value={guardianInfo.relationship}
            onChange={(e) => onChange("relationship", e.target.value)}
            required
          >
            <option value="">Select Relationship</option>
            <option value="parent">Parent</option>
            <option value="guardian">Guardian</option>
            <option value="sibling">Sibling</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={guardianInfo.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="whatsappNumber">WhatsApp Number</label>
          <input
            type="tel"
            id="whatsappNumber"
            value={guardianInfo.whatsappNumber}
            onChange={(e) => onChange("whatsappNumber", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={guardianInfo.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </form>
    </div>
  );
}
