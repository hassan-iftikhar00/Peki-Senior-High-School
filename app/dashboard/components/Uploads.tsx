import React, { useState, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary";

interface UploadStatus {
  placementForm: string;
  nhisCard: string;
  idDocument: string;
  medicalRecords: string;
}

interface UploadsProps {
  uploadStatus: Partial<UploadStatus>;
  setUploadStatus: (newStatus: UploadStatus) => void;
}

const defaultUploadStatus: UploadStatus = {
  placementForm: "",
  nhisCard: "",
  idDocument: "",
  medicalRecords: "",
};

export default function Uploads({
  uploadStatus = {},
  setUploadStatus,
}: UploadsProps) {
  const [uploaded, setUploaded] = useState<Record<keyof UploadStatus, boolean>>(
    {
      placementForm: false,
      nhisCard: false,
      idDocument: false,
      medicalRecords: false,
    }
  );

  const [isUploading, setIsUploading] = useState<
    Record<keyof UploadStatus, boolean>
  >({
    placementForm: false,
    nhisCard: false,
    idDocument: false,
    medicalRecords: false,
  });

  const [fileCount, setFileCount] = useState<
    Record<keyof UploadStatus, number>
  >({
    placementForm: 0,
    nhisCard: 0,
    idDocument: 0,
    medicalRecords: 0,
  });

  const currentUploadStatus = { ...defaultUploadStatus, ...uploadStatus };

  useEffect(() => {
    console.log(
      "Uploads: useEffect running, uploadStatus:",
      currentUploadStatus
    );
    const newUploadedState = Object.entries(currentUploadStatus).reduce(
      (acc, [key, value]) => {
        acc[key as keyof UploadStatus] =
          value !== "" && value !== "Not uploaded";
        return acc;
      },
      {} as Record<keyof UploadStatus, boolean>
    );
    console.log("Uploads: New uploaded state:", newUploadedState);
    setUploaded(newUploadedState);

    // Update file count based on uploaded URLs
    const newFileCount = Object.entries(currentUploadStatus).reduce(
      (acc, [key, value]) => {
        acc[key as keyof UploadStatus] = value ? value.split(", ").length : 0;
        return acc;
      },
      {} as Record<keyof UploadStatus, number>
    );
    setFileCount(newFileCount);
  }, [uploadStatus]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: keyof UploadStatus
  ) => {
    console.log(`Uploads: File upload initiated for ${documentType}`);
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading((prev) => ({ ...prev, [documentType]: true }));
      try {
        const uploadPromises = Array.from(files).map((file) =>
          uploadToCloudinary(file)
        );
        const uploadedUrls = await Promise.all(uploadPromises);

        const newStatus = {
          ...currentUploadStatus,
          [documentType]: uploadedUrls.join(", "),
        };
        console.log("Uploads: Updating upload status:", newStatus);
        setUploadStatus(newStatus);
        setUploaded((prevUploaded) => ({
          ...prevUploaded,
          [documentType]: true,
        }));
        setFileCount((prevCount) => ({
          ...prevCount,
          [documentType]: uploadedUrls.length,
        }));
      } catch (error) {
        console.error(`Uploads: Error uploading ${documentType}:`, error);
        alert(`Failed to upload ${documentType}. Please try again.`);
        setUploadStatus({
          ...currentUploadStatus,
          [documentType]: "Not uploaded",
        });
      } finally {
        setIsUploading((prev) => ({ ...prev, [documentType]: false }));
      }
    }
  };

  const isRequired = (key: keyof UploadStatus) => key !== "medicalRecords";

  const getUploadStatusText = (key: keyof UploadStatus) => {
    if (!uploaded[key]) return "Not uploaded";
    const count = fileCount[key];
    return count === 1 ? "1 file uploaded" : `${count} files uploaded`;
  };

  console.log(
    "Uploads: Rendering component, uploadStatus:",
    currentUploadStatus
  );

  return (
    <div id="uploads" className="section">
      <h2 className="text-2xl font-bold mb-4">Document Uploads</h2>
      <p className="subtitle headings mb-6">Upload required documents!</p>
      <div className="document-upload grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(defaultUploadStatus) as Array<keyof UploadStatus>).map(
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
                    {isRequired(key) && (
                      <span className="required text-red-500 ml-1">*</span>
                    )}
                  </div>
                  <div
                    className="upload-status"
                    style={{
                      color: uploaded[key] ? "green" : "red",
                    }}
                  >
                    {getUploadStatusText(key)}
                  </div>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  id={key}
                  accept=".pdf,.jpg,.png"
                  multiple
                  required={isRequired(key)}
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, key)}
                  disabled={isUploading[key]}
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
