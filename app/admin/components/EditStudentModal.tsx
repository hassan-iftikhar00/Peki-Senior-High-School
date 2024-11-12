"use client";

import React, { useState, useEffect } from "react";

interface House {
  _id: string;
  name: string;
  gender: "Male" | "Female";
}

interface Student {
  fullName: string;
  indexNumber: string;
  gender?: string;
  aggregate: number;
  residence?: string;
  programme?: string;
  feePaid: boolean;
  house?: string;
  houseId?: string;
  houseName?: string;
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
  const [houses, setHouses] = useState<House[]>([]);

  useEffect(() => {
    console.log("Student data in modal:", student);
    setFormData(student);
    fetchHouses();
  }, [student]);

  const fetchHouses = async () => {
    try {
      const response = await fetch("/api/admin/houses");
      if (response.ok) {
        const data = await response.json();
        setHouses(data.houses);
      } else {
        console.error("Failed to fetch houses");
      }
    } catch (error) {
      console.error("Error fetching houses:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "feePaid") {
        return { ...prev, [name]: value === "true" };
      } else if (name === "house") {
        const selectedHouse = houses.find((h) => h._id === value);
        return {
          ...prev,
          houseId: value,
          houseName: selectedHouse ? selectedHouse.name : undefined,
        };
      } else if (name === "gender") {
        return {
          ...prev,
          [name]: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
        };
      } else if (name === "residence") {
        return {
          ...prev,
          [name]: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
        };
      } else if (name === "programme") {
        return { ...prev, [name]: value.toUpperCase() };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  console.log("Current formData:", formData);

  const genderOptions = ["Male", "Female"];
  const residenceOptions = ["Boarding", "Day"];
  const programmeOptions = [
    "VISUAL ARTS",
    "GENERAL ARTS",
    "GENERAL SCIENCE",
    "BUSINESS",
    "AGRICULTURAL SCIENCE",
    "HOME ECONOMICS",
  ];

  const getSelectedValue = (options: string[], value: string | undefined) => {
    if (!value) return "";
    const lowercaseValue = value.toLowerCase();
    const matchedOption = options.find(
      (option) => option.toLowerCase() === lowercaseValue
    );
    console.log(
      `Matching ${value} (${lowercaseValue}) against options:`,
      options,
      `Result: ${matchedOption}`
    );
    return matchedOption || value; // Return the original value if no match is found
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
            <label htmlFor="indexNumber">Index Number</label>
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
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={getSelectedValue(genderOptions, formData.gender)}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
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
              value={getSelectedValue(residenceOptions, formData.residence)}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select residence</option>
              {residenceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="programme">Programme</label>
            <select
              id="programme"
              name="programme"
              value={getSelectedValue(programmeOptions, formData.programme)}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select programme</option>
              {programmeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="feePaid">Payment Status</label>
            <select
              id="feePaid"
              name="feePaid"
              value={formData.feePaid.toString()}
              onChange={handleChange}
              className="form-select"
            >
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="house">House</label>
            <select
              id="house"
              name="house"
              value={formData.houseId || ""}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select house</option>
              {houses.map((house) => (
                <option key={house._id} value={house._id}>
                  {house.name}
                </option>
              ))}
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
