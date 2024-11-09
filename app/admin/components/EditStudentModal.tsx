"use client";

import React, { useState, useEffect } from "react";

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
  student: Student;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
}

export default function EditStudentModal({
  student,
  onClose,
  onSave,
}: EditStudentModalProps) {
  const [formData, setFormData] = useState<Student>(student);

  useEffect(() => {
    setFormData(student);
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "feePaid" ? value === "paid" : value,
    }));
  };

  return (
    <div className="delete-confirmation-modal">
      <div className="add-student-content">
        <div className="add-student-header">
          <h3>Edit Student</h3>
          <button onClick={onClose} className="close-button-add not-admin">
            ×
          </button>
        </div>
        <p className="subtitle">Edit the student's information.</p>

        <form onSubmit={handleSubmit} className="add-student-form">
          <div className="form-group">
            <label htmlFor="fullName">Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input not-admin-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="indexNumber">Index Number </label>
            <input
              type="text"
              id="indexNumber"
              name="indexNumber"
              value={formData.indexNumber}
              onChange={handleChange}
              required
              className="form-input not-admin-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="aggregate">Aggregate</label>
            <input
              type="number"
              id="aggregate"
              name="aggregate"
              value={formData.aggregate}
              onChange={handleChange}
              className="form-input not-admin-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="residence">Residence</label>
            <select
              id="residence"
              name="residence"
              value={formData.residence}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select residence</option>
              <option value="boarding">Boarding</option>
              <option value="day">Day</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="programme">Programme</label>
            <select
              id="programme"
              name="programme"
              value={formData.programme}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select programme</option>
              <option value="science">General Arts</option>
              <option value="arts">General Science</option>
              <option value="business">Business</option>
              <option value="agriculturalscience">Agricultural Science</option>
              <option value="homeeconomics">Home Economics</option>
              <option value="visualarts">Visual Arts</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="feePaid">Payment Status </label>
            <select
              id="feePaid"
              name="feePaid"
              value={formData.feePaid ? "paid" : "unpaid"}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select payment status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div className="form-footer">
            <button type="submit" className="add-student-button not-admin">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
