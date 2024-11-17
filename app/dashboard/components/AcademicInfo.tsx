"use client";

import React, { useState, useEffect } from "react";
import { useSchoolSettings } from "@/app/contexts/SchoolSettingsContext";

interface Class {
  _id: string;
  name: string;
  programme: string;
  capacity: number;
  occupancy: number;
  coreSubjects: string[];
  electiveSubjects: string[];
}

interface AcademicData {
  selectedClass: string;
  classCapacity: string;
  coreSubjects: string[];
  electiveSubjects: string[];
}

interface AcademicInfoProps {
  programme: string;
  academicInfo: AcademicData;
  onAcademicInfoChange: (newAcademicInfo: AcademicData) => void;
  isEditMode: boolean;
}

export default function AcademicInfo({
  programme,
  academicInfo,
  onAcademicInfoChange,
  isEditMode,
}: AcademicInfoProps) {
  const { settings } = useSchoolSettings();
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(
    academicInfo.selectedClass
  );
  const [coreSubjects, setCoreSubjects] = useState<string[]>(
    academicInfo.coreSubjects
  );
  const [electiveSubjects, setElectiveSubjects] = useState<string[]>(
    academicInfo.electiveSubjects
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.isClassSelectionEnabled) {
      fetchAvailableClasses();
    }
  }, [programme, settings.isClassSelectionEnabled]);

  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(
        `/api/admin/classes?programme=${encodeURIComponent(programme)}`
      );
      if (response.ok) {
        const data: Class[] = await response.json();
        console.log("Fetched classes:", data);

        const validClasses = data.filter((cls) => {
          if (
            !cls ||
            typeof cls.capacity !== "number" ||
            typeof cls.occupancy !== "number"
          ) {
            console.error(`Invalid class data:`, cls);
            return false;
          }
          return true;
        });

        setAvailableClasses(validClasses);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch available classes");
      }
    } catch (error) {
      console.error("Error fetching available classes:", error);
      setError("An error occurred while fetching classes");
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (classId === "") {
      onAcademicInfoChange({
        selectedClass: "",
        classCapacity: "",
        coreSubjects: [],
        electiveSubjects: [],
      });
      setCoreSubjects([]);
      setElectiveSubjects([]);
    } else {
      const selectedClassData = availableClasses.find(
        (cls) => cls._id === classId
      );
      if (selectedClassData) {
        setCoreSubjects(selectedClassData.coreSubjects);
        setElectiveSubjects(selectedClassData.electiveSubjects);
        onAcademicInfoChange({
          selectedClass: classId,
          classCapacity: selectedClassData.capacity.toString(),
          coreSubjects: selectedClassData.coreSubjects,
          electiveSubjects: selectedClassData.electiveSubjects,
        });
      }
    }
  };

  const getRemainingSeats = (cls: Class | undefined): number => {
    if (
      !cls ||
      typeof cls.capacity !== "number" ||
      typeof cls.occupancy !== "number"
    ) {
      console.error(`Invalid class data:`, cls);
      return 0;
    }
    return Math.max(0, cls.capacity - cls.occupancy);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div id="academic" className="section academic-info">
      <h2>Academic Information</h2>
      <p className="subtitle headings">Your academic details</p>
      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <label htmlFor="program">Program</label>
          <input type="text" id="program" value={programme} disabled />
        </div>
        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <label htmlFor="class">Class</label>
          {settings.isClassSelectionEnabled ? (
            <select
              id="class"
              value={selectedClass}
              onChange={handleClassChange}
              className="form-select"
              disabled={!isEditMode}
            >
              <option value="">Select a class</option>
              {availableClasses.map((cls) => (
                <option
                  key={cls._id}
                  value={cls._id}
                  disabled={getRemainingSeats(cls) === 0}
                >
                  {cls.name} ({getRemainingSeats(cls)} seats remaining)
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="class"
              value="Yet to be decided!"
              className="yet-to-be-decided"
              disabled
            />
          )}
        </div>
        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <div className="capacity-display">
            <span className="capacity-label">Remaining Seats</span>
            <span className="capacity-value">
              {selectedClass
                ? `${getRemainingSeats(
                    availableClasses.find((cls) => cls._id === selectedClass)
                  )} seats`
                : "N/A"}
            </span>
          </div>
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <fieldset id="coreSubjects" className="subject-group">
            <legend>Core Subjects</legend>
            {academicInfo.coreSubjects &&
            academicInfo.coreSubjects.length > 0 ? (
              academicInfo.coreSubjects.map((subject) => (
                <div key={subject}>
                  <input
                    type="checkbox"
                    id={subject.toLowerCase().replace(/\s+/g, "-")}
                    name="coreSubject"
                    value={subject}
                    checked
                    disabled
                  />
                  <label htmlFor={subject.toLowerCase().replace(/\s+/g, "-")}>
                    {subject}
                  </label>
                </div>
              ))
            ) : (
              <p>No core subjects available for this class.</p>
            )}
          </fieldset>
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <fieldset id="electiveSubjects" className="subject-group">
            <legend>Elective Subjects</legend>
            {settings.isClassSelectionEnabled ? (
              electiveSubjects.length > 0 ? (
                electiveSubjects.map((subject) => (
                  <div key={subject}>
                    <input
                      type="checkbox"
                      id={subject.toLowerCase().replace(/\s+/g, "-")}
                      name="electiveSubject"
                      value={subject}
                      checked
                      disabled
                    />
                    <label htmlFor={subject.toLowerCase().replace(/\s+/g, "-")}>
                      {subject}
                    </label>
                  </div>
                ))
              ) : (
                <p>No elective subjects available for this class.</p>
              )
            ) : (
              <p className="yet-to-be-decided">Yet to be decided!</p>
            )}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
