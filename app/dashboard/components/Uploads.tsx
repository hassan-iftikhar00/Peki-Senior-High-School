import { useEffect } from "react";

interface UploadStatus {
  placementForm: string;
  nhisCard: string;
  idDocument: string;
  medicalRecords: string;
}

interface UploadsProps {
  uploadStatus: UploadStatus; // Define the type of uploadStatus
  setUploadStatus: React.Dispatch<React.SetStateAction<UploadStatus>>; // Use UploadStatus type
}

export default function Uploads({
  uploadStatus,
  setUploadStatus,
}: UploadsProps) {
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: keyof UploadStatus // Ensure the documentType matches the keys of UploadStatus
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadStatus((prevStatus) => ({
        ...prevStatus,
        [documentType]: `Uploaded: ${files.length} file(s)`, // Update the upload status
      }));
    }
  };

  return (
    <div id="uploads" className="section">
      <h2>Document Uploads</h2>
      <p className="subtitle headings">Upload required documents!</p>
      <div className="document-upload">
        <div className="document-item">
          <div className="document-logo">
            <div>
              <span className="document-icon">📄</span>
            </div>
            <div className="document-info">
              <div className="document-name">
                Placement Form <b>(soft copy) </b>
                <span className="required">*</span>
              </div>
              <div className="document-status">
                {uploadStatus.placementForm}
              </div>
            </div>
          </div>
          <div>
            <input
              type="file"
              id="placementForm"
              accept=".pdf,.jpg,.png"
              multiple
              required
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e, "placementForm")}
            />
            <label htmlFor="placementForm" className="upload-button">
              Upload
            </label>
          </div>
        </div>
        <div className="document-item">
          <div className="document-logo">
            <div>
              <span className="document-icon">🏥</span>
            </div>
            <div className="document-info">
              <div className="document-name">
                NHIS Card <span className="required">*</span>
              </div>
              <div className="document-status">{uploadStatus.nhisCard}</div>
            </div>
          </div>
          <div>
            <input
              type="file"
              id="nhisCard"
              accept=".pdf,.jpg,.png"
              required
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e, "nhisCard")}
            />
            <label htmlFor="nhisCard" className="upload-button">
              Upload
            </label>
          </div>
        </div>
        <div className="document-item">
          <div className="document-logo">
            <div>
              <span className="document-icon">🆔</span>
            </div>
            <div className="document-info">
              <div className="document-name">
                Birth Certificate or Ghana Card{" "}
                <span className="required">*</span>
              </div>
              <div className="document-status">{uploadStatus.idDocument}</div>
            </div>
          </div>
          <div>
            <input
              type="file"
              id="idDocument"
              accept=".jpg,.png,.pdf"
              required
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e, "idDocument")}
            />
            <label htmlFor="idDocument" className="upload-button">
              Upload
            </label>
          </div>
        </div>
        <div className="document-item">
          <div className="document-logo">
            <div>
              <span className="document-icon">🩺</span>
            </div>
            <div className="document-info">
              <div className="document-name">Medical Records</div>
              <div className="document-status">
                {uploadStatus.medicalRecords}
              </div>
            </div>
          </div>
          <div>
            <input
              type="file"
              id="medicalRecords"
              accept=".pdf,.jpg,.png"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e, "medicalRecords")}
            />
            <label htmlFor="medicalRecords" className="upload-button">
              Upload
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
