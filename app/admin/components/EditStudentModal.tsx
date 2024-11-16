"use client";

import React, { useState, useEffect } from "react";

interface House {
  _id: string;
  name: string;
  gender: "Male" | "Female";
}

interface Programme {
  _id: string;
  name: string;
  color: string;
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
  houseAssigned?: string;
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
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  useEffect(() => {
    console.log("Student data in modal:", student);
    setFormData(student);
    fetchHouses();
    fetchProgrammes();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "house") {
        const selectedHouse = houses.find((h) => h._id === value);
        return {
          ...prev,
          houseId: value,
          houseName: selectedHouse ? selectedHouse.name : undefined,
          houseAssigned: selectedHouse ? selectedHouse.name : undefined,
        };
      } else if (name === "gender") {
        const newGender =
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        return {
          ...prev,
          [name]: newGender,
          houseId: undefined,
          houseName: undefined,
          houseAssigned: undefined,
        };
      } else if (name === "residence") {
        return {
          ...prev,
          [name]: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
        };
      } else if (name === "programme") {
        return { ...prev, [name]: value };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  console.log("Current formData:", formData);

  const genderOptions = ["Male", "Female"];
  const residenceOptions = ["Boarding", "Day"];

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
    return matchedOption || value;
  };

  const filteredHouses = houses.filter(
    (house) => house.gender.toLowerCase() === formData.gender?.toLowerCase()
  );

  const showHouseSelection =
    formData.houseAssigned || formData.houseName || formData.house;

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

          <div className="form-group">
            <label htmlFor="feePaid">Payment Status</label>
            <div className="fee-paid-status">
              {formData.feePaid ? "Paid" : "Unpaid"}
            </div>
          </div>

          {showHouseSelection && (
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
                {filteredHouses.map((house) => (
                  <option key={house._id} value={house._id}>
                    {house.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
