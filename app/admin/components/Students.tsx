"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EditStudentModal from "./EditStudentModal";
import AddStudentModal from "./AddStudentModal";
import BulkUploadModal from "./BulkUploadModal";

interface Student {
  fullName: string;
  indexNumber: string;
  gender?: string;
  aggregate: number;
  residence?: string;
  programme?: string;
  feePaid: boolean;
  houseAssigned?: string;
  houseName?: string;
  house?: string;
  className?: string;
}
interface Column {
  key: keyof Student;
  label: string;
  visible: boolean;
}
interface Column {
  key: keyof Student;
  label: string;
  visible: boolean;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { key: "fullName", label: "Full Name", visible: true },
    { key: "indexNumber", label: "Index Number", visible: true },
    { key: "gender", label: "Gender", visible: true },
    { key: "aggregate", label: "Aggregate", visible: true },
    { key: "residence", label: "Residence", visible: true },
    { key: "programme", label: "Programme", visible: true },
    { key: "feePaid", label: "Payment Status", visible: true },
    { key: "houseAssigned", label: "House", visible: true },
    { key: "className", label: "Class", visible: true },
  ]);
  const router = useRouter();

  const columnsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/admin/students-data-fetch", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Unauthorized access, redirecting to login");
            router.push("/admin/login");
            return;
          }
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load students. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        columnsDropdownRef.current &&
        !columnsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowColumnsDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleEditClick = (student: Student) => {
    console.log("Editing student:", student);
    setEditingStudent(student);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prevStudents) => [...prevStudents, newStudent]);
  };

  const handleEditClose = () => {
    setEditingStudent(null);
  };

  const handleBulkUploadSuccess = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/students-data-fetch", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch updated students");
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching updated students:", error);
      setError("Failed to refresh student list. Please reload the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSave = async (updatedStudent: Student) => {
    try {
      if (!editingStudent) {
        console.error("No student is currently being edited");
        return;
      }

      const response = await fetch("/api/admin/students", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldIndexNumber: editingStudent.indexNumber,
          ...updatedStudent,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      const updatedStudentData = await response.json();

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.indexNumber === editingStudent.indexNumber
            ? {
                ...student,
                ...updatedStudentData,
                houseAssigned:
                  updatedStudentData.houseName || updatedStudentData.house,
              }
            : student
        )
      );
      setEditingStudent(null);

      // Fetch updated student data
      const studentsResponse = await fetch("/api/admin/students-data-fetch", {
        credentials: "include",
      });

      if (studentsResponse.ok) {
        const updatedStudents = await studentsResponse.json();
        setStudents(updatedStudents);
      } else {
        console.error("Failed to fetch updated student data");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;

    try {
      const response = await fetch("/api/admin/students", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ indexNumber: deletingStudent.indexNumber }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      setStudents((prevStudents) =>
        prevStudents.filter(
          (student) => student.indexNumber !== deletingStudent.indexNumber
        )
      );
      setDeletingStudent(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleDeleteCancel = () => {
    setDeletingStudent(null);
  };

  const toggleColumnVisibility = (key: keyof Student) => {
    setColumns(
      columns.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  if (isLoading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="inner-content">
      <div className="students-page">
        <div className="students-header">
          <h2>Students</h2>
          <p className="subtitle">Manage your student applicants here.</p>
        </div>

        <div className="students-toolbar">
          <div className="toolbar-left">
            <div
              className={`columns-dropdown ${
                showColumnsDropdown ? "active" : ""
              }`}
              ref={columnsDropdownRef}
            >
              <button
                className="columns-button not-admin"
                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
              >
                Columns
              </button>
              {showColumnsDropdown && (
                <div className="columns-dropdown-content">
                  {columns.map((column) => (
                    <label key={column.key} className="column-checkbox">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => toggleColumnVisibility(column.key)}
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search students"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="toolbar-right">
            <button
              className="add-button not-admin"
              onClick={() => setShowAddModal(true)}
            >
              <span className="plus-icon">+</span> Add Applicant
            </button>
            <button
              className="import-button not-admin"
              onClick={() => setShowBulkUploadModal(true)}
            >
              Bulk Import (CSV)
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                {columns
                  .filter((col) => col.visible)
                  .map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.indexNumber}>
                  {columns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <td key={column.key}>
                        {column.key === "feePaid" ? (
                          <span
                            className={`status-badge ${
                              student.feePaid ? "status-paid" : "status-unpaid"
                            }`}
                          >
                            {student.feePaid ? "Paid" : "Unpaid"}
                          </span>
                        ) : column.key === "houseAssigned" ? (
                          student.houseAssigned ||
                          student.houseName ||
                          "Not Assigned"
                        ) : column.key === "className" ? (
                          student.className || "Not Assigned"
                        ) : (
                          (student[column.key] as string) || "N/A"
                        )}
                      </td>
                    ))}
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit-icon not-admin"
                        title="Edit"
                        onClick={() => handleEditClick(student)}
                      >
                        ✎
                      </button>
                      <button
                        className="icon-button delete-icon not-admin"
                        title="Delete"
                        onClick={() => handleDeleteClick(student)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="total-students">
            <span className="total-students-label">
              Total number of students:
            </span>
            <span className="total-students-count">
              {filteredStudents.length}
            </span>
          </div>
          <Pagination
            studentsPerPage={studentsPerPage}
            totalStudents={filteredStudents.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      </div>
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
      {deletingStudent && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete{" "}
              <span>{deletingStudent.fullName}?</span>
            </p>
            <div className="delete-confirmation-buttons">
              <button
                onClick={handleDeleteConfirm}
                className="confirm-delete-button"
              >
                Confirm
              </button>
              <button
                onClick={handleDeleteCancel}
                className="cancel-delete-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStudent}
        />
      )}
      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onUploadSuccess={handleBulkUploadSuccess}
        />
      )}
    </div>
  );
}

function Pagination({
  studentsPerPage,
  totalStudents,
  paginate,
  currentPage,
}: {
  studentsPerPage: number;
  totalStudents: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}) {
  const totalPages = Math.ceil(totalStudents / studentsPerPage);

  const renderPaginationButtons = () => {
    const buttons = [];

    buttons.push(
      <button
        key="prev"
        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button not-admin"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    buttons.push(
      <button
        key={1}
        onClick={() => paginate(1)}
        className={`pagination-number not-admin ${
          currentPage === 1 ? "active" : ""
        }`}
      >
        1
      </button>
    );

    if (currentPage > 4) {
      buttons.push(
        <span key="dots-1" className="pagination-dots">
          ...
        </span>
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(currentPage + 1, totalPages - 1);
      i++
    ) {
      if (i < totalPages) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`pagination-number not-admin ${
              currentPage === i ? "active" : ""
            }`}
          >
            {i}
          </button>
        );
      }
    }

    if (currentPage < totalPages - 3) {
      buttons.push(
        <span key="dots-2" className="pagination-dots">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`pagination-number not-admin ${
            currentPage === totalPages ? "active" : ""
          }`}
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button not-admin"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );

    return buttons;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-buttons">{renderPaginationButtons()}</div>
    </div>
  );
}
