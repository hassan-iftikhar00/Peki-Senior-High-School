"use client";

import React, { useCallback } from "react";
import { X } from "lucide-react";

interface Student {
  fullName: string;
  indexNumber: string;
}

interface HouseStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseName: string;
  students: Student[];
}

export default function HouseStudentsModal({
  isOpen,
  onClose,
  houseName,
  students,
}: HouseStudentsModalProps) {
  if (!isOpen) return null;

  const handleDownload = useCallback(() => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Full Name,Index Number\n" +
      students
        .map((student) => `${student.fullName},${student.indexNumber}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    const safeHouseName = houseName.trim()
      ? houseName.trim().replace(/\s+/g, "_")
      : "house";
    link.setAttribute("download", `${safeHouseName}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [students, houseName]);

  return (
    <div className="house-students-modal-overlay">
      <div className="house-students-modal">
        <div className="house-students-modal-header">
          <h2>{houseName} Students</h2>
          <button
            onClick={onClose}
            className="house-modal-close-button not-admin"
          >
            <X size={24} />
          </button>
        </div>
        <div className="house-students-table-container">
          <table className="house-students-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Index Number</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.fullName}</td>
                  <td>{student.indexNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="house-students-modal-footer">
          <button
            onClick={handleDownload}
            className="download-button not-admin"
          >
            Download as CSV
          </button>
        </div>
      </div>
    </div>
  );
}
