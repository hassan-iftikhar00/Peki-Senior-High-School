import React, { useState } from "react";
import Image from "next/image";

export default function SchoolSettings() {
  const [schoolName, setSchoolName] = useState("Peki Senior High School");
  const [schoolLogo, setSchoolLogo] = useState("/placeholder.svg");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSchoolLogo(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="inner-content">
      <div className="settings-page">
        <div className="settings-header">
          <h2>School Settings</h2>
          <p className="subtitle">Manage your school's information here.</p>
        </div>

        <div className="settings-card">
          <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="schoolName">School Name</label>
              <input
                type="text"
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="settings-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="schoolLogo">School Logo</label>
              <div className="logo-section">
                <div className="logo-preview">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg"
                    alt="Peki Senior High School Logo"
                    width={40}
                    height={40}
                    className="school-logo"
                  />{" "}
                </div>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="schoolLogo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file-input"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="save-button not-admin">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
