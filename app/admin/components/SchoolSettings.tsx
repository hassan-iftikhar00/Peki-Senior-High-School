"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSchoolSettings } from "@/app/contexts/SchoolSettingsContext";

export default function SchoolSettings() {
  const { settings, updateSettings } = useSchoolSettings();
  const [schoolName, setSchoolName] = useState(settings.name);
  const [schoolLogo, setSchoolLogo] = useState(settings.logo);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogo = e.target?.result as string;
        setSchoolLogo(newLogo);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await updateSettings({ name: schoolName }, logoFile || undefined);
      setIsSaved(true);
    } catch (err) {
      setError("Failed to update settings. Please try again.");
    } finally {
      setIsLoading(false);
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
          <form className="settings-form" onSubmit={handleSubmit}>
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
                    src={schoolLogo}
                    alt={`${schoolName} Logo`}
                    width={40}
                    height={40}
                    className="school-logo"
                  />
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

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className={`save-button not-admin ${
                isSaved ? "school-setting-saved-button" : ""
              }`}
              disabled={isLoading || isSaved}
            >
              {isLoading ? "Saving..." : isSaved ? "Saved" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
