import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Student {
  fullName: string;
  indexNumber: string;
  gender: string;
  aggregate: number;
  residence: string;
  programme: string;
  feePaid: boolean;
}

interface EditStudentModalProps {
  student: Student | null;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
}

export default function EditStudentModal({
  student,
  onClose,
  onSave,
}: EditStudentModalProps) {
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);

  useEffect(() => {
    setEditedStudent(student);
  }, [student]);

  if (!editedStudent) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setEditedStudent((prev) => ({
      ...prev!,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedStudent);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          onClick={onClose}
          className="close-button-edit  not-admin"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="modal-title">Edit Student</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="not-admin-input"
              value={editedStudent.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="indexNumber">Index Number</label>
            <input
              type="text"
              id="indexNumber"
              name="indexNumber"
              className="not-admin-input"
              value={editedStudent.indexNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={editedStudent.gender}
              onChange={handleChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="aggregate">Aggregate</label>
            <input
              type="number"
              id="aggregate"
              name="aggregate"
              className="not-admin-input"
              value={editedStudent.aggregate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="residence">Residence</label>
            <input
              type="text"
              id="residence"
              name="residence"
              className="not-admin-input"
              value={editedStudent.residence}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="programme">Programme</label>
            <input
              type="text"
              id="programme"
              name="programme"
              className="not-admin-input"
              value={editedStudent.programme}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="feePaid">Fee Paid</label>
            <select
              id="feePaid"
              name="feePaid"
              value={editedStudent.feePaid.toString()}
              onChange={(e) =>
                setEditedStudent((prev) => ({
                  ...prev!,
                  feePaid: e.target.value === "true",
                }))
              }
              required
            >
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
          </div>
          <div className="button-group">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button not-admin"
            >
              Cancel
            </button>
            <button type="submit" className="save-button not-admin">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
