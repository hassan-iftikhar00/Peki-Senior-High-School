"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EditStudentModal from "./EditStudentModal";
import AddStudentModal from "./AddStudentModal";

interface Student {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: number;
  residence: string;
  programme: string;
  feePaid: boolean;
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
  const router = useRouter();

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

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
    setEditingStudent(student);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prevStudents) => [...prevStudents, newStudent]);
  };

  const handleEditClose = () => {
    setEditingStudent(null);
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
            ? updatedStudentData
            : student
        )
      );
      setEditingStudent(null);
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

  if (isLoading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="inner-content ">
      <div className="students-page">
        <div className="students-header">
          <h2>Students</h2>
          <p className="subtitle">Manage your student applicants here.</p>
        </div>

        <div className="students-toolbar">
          <div className="toolbar-left">
            <button className="columns-button not-admin">Columns</button>
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
            <button className="import-button not-admin">
              Bulk Import (CSV)
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Index Number</th>
                <th>Gender</th>
                <th>Aggregate</th>
                <th>Residence</th>
                <th>Programme</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.indexNumber}>
                  <td>{student.fullName}</td>
                  <td>{student.indexNumber}</td>
                  <td>{student.gender}</td>
                  <td>{student.aggregate}</td>
                  <td>{student.residence}</td>
                  <td>{student.programme}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        student.feePaid ? "status-paid" : "status-unpaid"
                      }`}
                    >
                      {student.feePaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
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
    </div>
  );
}

interface PaginationProps {
  studentsPerPage: number;
  totalStudents: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

function Pagination({
  studentsPerPage,
  totalStudents,
  paginate,
  currentPage,
}: PaginationProps) {
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
