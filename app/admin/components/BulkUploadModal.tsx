"use client";

import React, { useState, useRef } from "react";
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
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sample CSV file URL (replace with your Cloudinary URL)
  const sampleCsvUrl =
    "https://res.cloudinary.com/dah9roj2d/raw/upload/v1730991654/md64m8sgarrnb2y40ui2.csv";

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
      setUploadResults(null);
    } else {
      setFile(null);
      setError("Please select a valid CSV file.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0] || null;
    handleFileChange(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadResults(result);
      if (result.failed === 0) {
        onUploadSuccess();
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please reopen the popup and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bulk-upload-modal-overlay">
      <div className="bulk-upload-modal-content">
        <div className="bulk-upload-modal-header">
          <h2 className="bulk-upload-modal-title">Bulk Upload Students</h2>
          <button
            onClick={onClose}
            className="bulk-upload-close-button not-admin"
          >
            <svg className="bulk-upload-close-icon" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bulk-upload-form">
          <div className="bulk-upload-file-area">
            <label
              htmlFor="csvFile"
              className={`bulk-upload-file-label ${
                isDragging ? "dragging" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="bulk-upload-file-content">
                <Upload className="bulk-upload-icon" />
                <p className="bulk-upload-text">
                  <span className="bulk-upload-text-bold">Click to upload</span>{" "}
                  or drag and drop
                </p>
                <p className="bulk-upload-subtext">CSV file only</p>
              </div>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleInputChange}
                className="bulk-upload-file-input"
                ref={fileInputRef}
              />
            </label>
          </div>
          {file && (
            <p className="bulk-upload-selected-file">
              Selected file: {file.name}
            </p>
          )}
          {error && (
            <p className="bulk-upload-error-message">
              <AlertCircle className="bulk-upload-error-icon" />
              {error}
            </p>
          )}
          {uploadResults && (
            <div className="bulk-upload-results">
              <p>Successfully uploaded: {uploadResults.success}</p>
              <p>Failed to upload: {uploadResults.failed}</p>
              {uploadResults.errors.length > 0 && (
                <div className="bulk-upload-errors">
                  <h4>Errors:</h4>
                  <ul>
                    {uploadResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="bulk-upload-form-footer">
            <button
              type="submit"
              className={`bulk-upload-button not-admin ${
                uploading ? "bulk-upload-button-uploading" : ""
              }`}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>

        <div className="bulk-upload-instructions-section">
          <h3 className="bulk-upload-instructions-title">
            CSV Format Instructions
          </h3>
          <div className="bulk-upload-important-note">
            <AlertCircle className="bulk-upload-important-icon" />
            <p className="bulk-upload-important-text">
              <strong>Important:</strong> The headers must match exactly as
              shown below, including lowercase and uppercase letters. The file
              type must be <b> CSV (Comma Delimited)</b>
            </p>
          </div>
          <p className="bulk-upload-instructions-text">
            The CSV file should have the following columns with headers:
          </p>
          <ul className="bulk-upload-header-list">
            <li>fullName (required)</li>
            <li>indexNumber (required, unique)</li>
            <li>gender (required, 'male' or 'female')</li>
            <li>aggregate (optional, number)</li>
            <li>residence (optional, 'boarding' or 'day')</li>
            <li>programme (optional)</li>
            <li>feePaid (required, 'true' or 'false')</li>
          </ul>
          <div className="bulk-upload-download-section">
            <FileText className="bulk-upload-download-icon" />
            <a
              href={sampleCsvUrl}
              download="sample_students.csv"
              className="bulk-upload-download-link"
              onClick={(e) => {
                e.preventDefault();
                fetch(sampleCsvUrl)
                  .then((response) => response.blob())
                  .then((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.style.display = "none";
                    a.href = url;
                    a.download = "sample_candidates.csv";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                  })
                  .catch(() =>
                    alert("An error occurred while downloading the file.")
                  );
              }}
            >
              Download Sample CSV File
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
