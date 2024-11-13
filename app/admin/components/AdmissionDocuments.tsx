"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Pencil, Trash2, Loader2 } from "lucide-react";

interface Document {
  _id: string;
  name: string;
  type:
    | "admissionLetterTemplate"
    | "prospectus"
    | "personalRecordTemplate"
    | "otherDocuments";
  url: string;
}

export default function AdmissionDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/admin/documents?type=all");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleReplacePDF = async (formData: FormData) => {
    setIsUploading(true);
    try {
      const response = await fetch("/api/admin/documents", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to replace document");
      }

      const updatedDocumentData = await response.json();
      setDocuments(
        documents.map((doc) =>
          doc._id === updatedDocumentData._id ? updatedDocumentData : doc
        )
      );
      setIsReplaceModalOpen(false);
      setCurrentDocument(null);
    } catch (error) {
      console.error("Error replacing document:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to replace document. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const response = await fetch("/api/admin/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }

      setDocuments(documents.filter((doc) => doc._id !== id));
      setIsDeleteModalOpen(false);
      setCurrentDocument(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete document. Please try again."
      );
    }
  };

  if (isLoading) return <div>Loading documents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="inner-content">
      <div className="admission-documents-page">
        <div className="documents-card">
          <div className="documents-header">
            <h2>Admission Documents</h2>
            <p className="subtitle">Manage admission documents.</p>
          </div>

          <div className="document-uploads">
            {documents.map((doc) => (
              <div key={doc._id} className="document-upload-group">
                <label>{doc.name}</label>
                <div className="upload-controls">
                  <a
                    href={doc.url}
                    download
                    className="download-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                  <button
                    className="replace-button not-admin"
                    onClick={() => {
                      setCurrentDocument(doc);
                      setIsReplaceModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Replace PDF
                  </button>
                  <button
                    className="delete-button not-admin"
                    onClick={() => {
                      setCurrentDocument(doc);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isReplaceModalOpen && currentDocument && (
        <ReplacePDFModal
          document={currentDocument}
          onClose={() => {
            setIsReplaceModalOpen(false);
            setCurrentDocument(null);
          }}
          onReplace={handleReplacePDF}
          isUploading={isUploading}
        />
      )}

      {isDeleteModalOpen && currentDocument && (
        <DeleteConfirmationModal
          document={currentDocument}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCurrentDocument(null);
          }}
          onConfirm={() => handleDeleteDocument(currentDocument._id)}
        />
      )}
    </div>
  );
}

interface ReplacePDFModalProps {
  document: Document;
  onClose: () => void;
  onReplace: (formData: FormData) => void;
  isUploading: boolean;
}

function ReplacePDFModal({
  document,
  onClose,
  onReplace,
  isUploading,
}: ReplacePDFModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileInputRef.current?.files?.[0]) {
      const formData = new FormData();
      formData.append("_id", document._id);
      formData.append("file", fileInputRef.current.files[0]);
      onReplace(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Replace PDF</h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="file">New PDF File</label>
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              accept=".pdf"
              required
            />
          </div>
          <div className="form-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Replace PDF"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmationModalProps {
  document: Document;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({
  document,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Delete Document</h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
        <p>Are you sure you want to delete the document "{document.name}"?</p>
        <div className="form-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-button">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
