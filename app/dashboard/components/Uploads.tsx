"use client";

import React, { useState, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { Trash2 } from "lucide-react";

export interface UploadStatus {
  placementForm: string[];
  nhisCard: string | null;
  idDocument: string | null;
  medicalRecords: string[];
}

type DocumentType = keyof UploadStatus;

interface UploadsProps {
  initialUploadStatus: Partial<UploadStatus>;
  isDisabled?: boolean;
  onUploadStatusChange: (newStatus: UploadStatus) => void;
}

const defaultUploadStatus: UploadStatus = {
  placementForm: [],
  nhisCard: null,
  idDocument: null,
  medicalRecords: [],
};

export default function Uploads({
  initialUploadStatus,
  onUploadStatusChange,
  isDisabled,
}: UploadsProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(() => {
    return {
      ...defaultUploadStatus,
      ...initialUploadStatus,
    };
  });

  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState<Record<DocumentType, boolean>>(
    {
      placementForm: false,
      nhisCard: false,
      idDocument: false,
      medicalRecords: false,
    }
  );

  useEffect(() => {
    onUploadStatusChange(uploadStatus);
  }, [uploadStatus, onUploadStatusChange]);

  const getDisplayName = (url: string | null): string => {
    if (!url) return "No file selected";
    return fileNames[url] || "Uploaded file";
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: DocumentType
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading((prev) => ({ ...prev, [documentType]: true }));

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const url = await uploadToCloudinary(file);
        if (url) {
          setFileNames((prev) => ({
            ...prev,
            [url]: file.name,
          }));
        }
        return url;
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean);

      setUploadStatus((prevStatus) => {
        if (
          documentType === "placementForm" ||
          documentType === "medicalRecords"
        ) {
          return {
            ...prevStatus,
            [documentType]: [...prevStatus[documentType], ...uploadedUrls],
          };
        } else {
          return {
            ...prevStatus,
            [documentType]: uploadedUrls[0] || null,
          };
        }
      });
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      alert(`Failed to upload ${documentType}. Please try again.`);
    } finally {
      setIsUploading((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  const handleDeleteFile = (documentType: DocumentType, index: number) => {
    setUploadStatus((prevStatus) => {
      if (
        documentType === "placementForm" ||
        documentType === "medicalRecords"
      ) {
        const newFiles = [...prevStatus[documentType]];
        newFiles.splice(index, 1);
        return { ...prevStatus, [documentType]: newFiles };
      } else {
        return { ...prevStatus, [documentType]: null };
      }
    });
  };

  const renderFileList = (documentType: DocumentType) => {
    const files = uploadStatus[documentType];

    if (!files || (Array.isArray(files) && files.length === 0)) {
      return <p className="text-sm text-gray-500">No files uploaded</p>;
    }

    if (Array.isArray(files)) {
      return (
        <div className="space-y-2">
          {files.map((url, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2"
            >
              <span className="text-sm truncate" title={getDisplayName(url)}>
                {getDisplayName(url)}
              </span>
              <button
                onClick={() => handleDeleteFile(documentType, index)}
                className="text-red-500 hover:text-red-700 ml-2 trash-uploads"
                aria-label={`Delete ${getDisplayName(url)}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
        <span className="text-sm truncate" title={getDisplayName(files)}>
          {getDisplayName(files)}
        </span>
        <button
          onClick={() => handleDeleteFile(documentType, 0)}
          className="text-red-500 hover:text-red-700 ml-2 trash-uploads"
          aria-label={`Delete ${getDisplayName(files)}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  return (
    <div id="uploads" className="section">
      <h2 className="text-2xl font-bold mb-4">Document Uploads</h2>
      <p className="subtitle headings mb-6">Upload required documents!</p>
      <div className="document-upload grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(defaultUploadStatus) as Array<DocumentType>).map(
          (key) => (
            <div
              key={key}
              className="document-item bg-white p-4 rounded-lg shadow-md"
            >
              <div className="document-logo flex items-center mb-4">
                <span className="document-icon text-3xl mr-3">
                  {key === "placementForm" && "📄"}
                  {key === "nhisCard" && "🏥"}
                  {key === "idDocument" && "🆔"}
                  {key === "medicalRecords" && "🩺"}
                </span>
                <div className="document-info">
                  <div className="document-name font-semibold">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    {key !== "medicalRecords" && (
                      <span className="required text-red-500 ml-1">*</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-4">{renderFileList(key)}</div>
              <div>
                <input
                  type="file"
                  id={key}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple={key === "placementForm" || key === "medicalRecords"}
                  required={key !== "medicalRecords"}
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, key)}
                  disabled={isUploading[key] || isDisabled}
                />
                <label
                  htmlFor={key}
                  className={`upload-button block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isUploading[key]
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {isUploading[key] ? "Uploading..." : "Upload"}
                </label>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
