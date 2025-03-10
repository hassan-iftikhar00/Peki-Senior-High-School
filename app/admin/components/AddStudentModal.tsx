"use client";

import React, { useState, useEffect } from "react";

interface Programme {
  _id: string;
  name: string;
  color: string;
}

interface AddStudentModalProps {
  onClose: () => void;
  onAdd: (student: any) => void;
}

export default function AddStudentModal({
  onClose,
  onAdd,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    indexNumber: "",
    gender: "",
    aggregate: "",
    residence: "",
    programme: "",
    feePaid: false,
  });
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const response = await fetch("/api/admin/programmes");
      if (response.ok) {
        const data = await response.json();
        setProgrammes(data);
      } else {
        console.error("Failed to fetch programmes");
      }
    } catch (error) {
      console.error("Error fetching programmes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add student");
      }

      const newStudent = await response.json();
      onAdd(newStudent);
      onClose();
    } catch (error) {
      console.error("Error adding student:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="delete-confirmation-modal">
      <div className="add-student-content">
        <div className="add-student-header">
          <h3>Add New Student</h3>
          <button onClick={onClose} className="close-button-add not-admin">
            ×
          </button>
        </div>
        <p className="subtitle">Enter the new student's information.</p>

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
              <option value="Boarding">Boarding</option>
              <option value="Day">Day</option>
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
              {programmes.map((programme) => (
                <option key={programme._id} value={programme.name}>
                  {programme.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-footer">
            <button type="submit" className="add-student-button not-admin">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
