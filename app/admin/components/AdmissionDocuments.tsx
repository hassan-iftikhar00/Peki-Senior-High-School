import React, { useState, ChangeEvent } from "react";
import { Download } from "lucide-react";

type DocumentType =
  | "admissionLetterTemplate"
  | "prospectus"
  | "personalRecordTemplate"
  | "otherDocuments";

interface AdmissionDocuments {
  admissionLetterTemplate: File | null;
  prospectus: File | null;
  personalRecordTemplate: File | null;
  otherDocuments: File[];
}

export default function AdmissionDocuments() {
  const [admissionDocuments, setAdmissionDocuments] =
    useState<AdmissionDocuments>({
      admissionLetterTemplate: null,
      prospectus: null,
      personalRecordTemplate: null,
      otherDocuments: [],
    });

  const handleFileUpload = (
    documentType: DocumentType,
    file: File | File[] | null
  ) => {
    if (file) {
      setAdmissionDocuments((prev) => ({
        ...prev,
        [documentType]: Array.isArray(file) ? file : file,
      }));
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    documentType: DocumentType
  ) => {
    const files = e.target.files;
    if (files) {
      if (documentType === "otherDocuments") {
        handleFileUpload(documentType, Array.from(files));
      } else {
        handleFileUpload(documentType, files[0]);
      }
    }
  };

  return (
    <div className="inner-content">
      <div className="admission-documents-page">
        <div className="documents-card">
          <div className="documents-header">
            <h2>Admission Documents</h2>
            <p className="subtitle">Manage and upload admission documents.</p>
          </div>

          <div className="document-uploads">
            <div className="document-upload-group">
              <label>Admission Letter Template</label>
              <div className="upload-controls">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, "admissionLetterTemplate")
                    }
                    id="admissionLetterTemplate"
                  />
                  <div className="file-input-text">
                    {admissionDocuments.admissionLetterTemplate?.name ||
                      "No file chosen"}
                  </div>
                </div>
                <button className="upload-button not-admin">
                  <Download className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>

            <div className="document-upload-group">
              <label>Prospectus</label>
              <div className="upload-controls">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "prospectus")}
                    id="prospectus"
                  />
                  <div className="file-input-text">
                    {admissionDocuments.prospectus?.name || "No file chosen"}
                  </div>
                </div>
                <button className="upload-button not-admin">
                  <Download className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>

            <div className="document-upload-group">
              <label>Personal Record Template</label>
              <div className="upload-controls">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, "personalRecordTemplate")
                    }
                    id="personalRecordTemplate"
                  />
                  <div className="file-input-text">
                    {admissionDocuments.personalRecordTemplate?.name ||
                      "No file chosen"}
                  </div>
                </div>
                <button className="upload-button not-admin">
                  <Download className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>

            <div className="document-upload-group">
              <label>Other Documents</label>
              <div className="upload-controls">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(e, "otherDocuments")}
                    id="otherDocuments"
                  />
                  <div className="file-input-text">
                    {admissionDocuments.otherDocuments.length > 0
                      ? `${admissionDocuments.otherDocuments.length} files selected`
                      : "No file chosen"}
                  </div>
                </div>
                <button className="upload-button not-admin">
                  <Download className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
