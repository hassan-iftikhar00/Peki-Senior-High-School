"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle, FileText } from "lucide-react";

interface BulkUploadModalProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function BulkUploadModal({
  onClose,
  onUploadSuccess,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sample CSV file URL (replace with your Cloudinary URL)
  const sampleCsvUrl =
    "https://res.cloudinary.com/your-cloud-name/raw/upload/v1234567890/sample_students.csv";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/students/bulk-upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      onUploadSuccess();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Bulk Upload Students</h2>
          <button onClick={onClose} className="close-button">
            <svg className="close-icon" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-upload-area">
            <label htmlFor="csvFile" className="file-upload-label">
              <div className="file-upload-content">
                <Upload className="upload-icon" />
                <p className="upload-text">
                  <span className="upload-text-bold">Click to upload</span> or
                  drag and drop
                </p>
                <p className="upload-subtext">CSV file only</p>
              </div>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>
          </div>
          {file && <p className="selected-file">Selected file: {file.name}</p>}
          {error && (
            <p className="error-message">
              <AlertCircle className="error-icon" />
              {error}
            </p>
          )}
          <div className="form-footer">
            <button
              type="submit"
              className={`upload-button ${uploading ? "uploading" : ""}`}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>

        <div className="instructions-section">
          <h3 className="instructions-title">CSV Format Instructions</h3>
          <div className="important-note">
            <AlertCircle className="important-icon" />
            <p className="important-text">
              <strong>Important:</strong> The headers must match exactly as
              shown below, including lowercase and uppercase letters.
            </p>
          </div>
          <p className="instructions-text">
            The CSV file should have the following columns with headers:
          </p>
          <ul className="header-list">
            <li>fullName (required)</li>
            <li>indexNumber (required, unique)</li>
            <li>gender (required, 'male' or 'female')</li>
            <li>aggregate (optional, number)</li>
            <li>residence (optional, 'boarding' or 'day')</li>
            <li>programme (optional)</li>
            <li>feePaid (required, 'true' or 'false')</li>
          </ul>
          <div className="download-section">
            <FileText className="download-icon" />
            <a
              href={sampleCsvUrl}
              download="sample_students.csv"
              className="download-link"
            >
              Download Sample CSV File
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
