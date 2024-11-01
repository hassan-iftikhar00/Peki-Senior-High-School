import React, { useState, useEffect } from "react";

interface ProgramClasses {
  [key: string]: string[];
}

interface ClassCapacities {
  [key: string]: {
    [key: string]: number;
  };
}

interface ProgramElectives {
  [key: string]: string[];
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
}

interface ApiResponse {
  occupancy?: {
    [programme: string]: {
      [className: string]: number;
    };
  };
  error?: string;
}

const programClasses: ProgramClasses = {
  "General Arts": ["Form 1 Arts", "Form 2 Arts", "Form 3 Arts"],
  "General Science": ["G. Sci A", "G. Sci B"],
  Business: ["Form 1 Business", "Form 2 Business", "Form 3 Business"],
  "Visual Arts": [
    "Form 1 Visual Arts",
    "Form 2 Visual Arts",
    "Form 3 Visual Arts",
  ],
  "Home Economics": [
    "Form 1 Home Economics",
    "Form 2 Home Economics",
    "Form 3 Home Economics",
  ],
};

const programElectives: ProgramElectives = {
  "General Arts": ["Literature", "Government", "Economics", "French"],
  "General Science": [
    "Physics",
    "Chemistry",
    "Biology",
    "Elective Mathematics",
  ],
  Business: [
    "Financial Accounting",
    "Cost Accounting",
    "Business Management",
    "Economics",
  ],
  "Visual Arts": ["Graphic Design", "Picture Making", "Ceramics", "Sculpture"],
  "Home Economics": [
    "Food and Nutrition",
    "Clothing and Textiles",
    "Management in Living",
    "General Knowledge in Art",
  ],
};

const coreSubjectsForAllPrograms = [
  "English Language",
  "Core Mathematics",
  "Integrated Science",
  "Social Studies",
];

export default function AcademicInfo({
  programme,
  academicInfo,
}: AcademicInfoProps) {
  const [classCapacity, setClassCapacity] = useState<string>("");
  useEffect(() => {
    fetchClassCapacity();
  }, []);

  const fetchClassCapacity = async () => {
    try {
      const response = await fetch("/api/class-occupancy");
      const data: ApiResponse = await response.json();

      if (
        data.occupancy &&
        data.occupancy[programme] &&
        data.occupancy[programme][academicInfo.selectedClass]
      ) {
        const totalCapacity = 45;
        const occupiedSeats =
          data.occupancy[programme][academicInfo.selectedClass];
        const availableSeats = Math.max(0, totalCapacity - occupiedSeats);
        setClassCapacity(`${availableSeats} seats left`);
      } else {
        setClassCapacity("Capacity data not available");
      }
    } catch (error) {
      console.error("Error fetching class capacity:", error);
      setClassCapacity("Error fetching capacity");
    }
  };

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
          <input
            type="text"
            id="class"
            value={academicInfo.selectedClass}
            disabled
          />
        </div>
        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <div className="capacity-display">
            <span className="capacity-label">Class Capacity</span>
            <span className="capacity-value">{classCapacity}</span>
          </div>
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <fieldset id="coreSubjects" className="subject-group">
            <legend>Core Subjects</legend>
            {coreSubjectsForAllPrograms.map((subject) => (
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
            ))}
          </fieldset>
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <fieldset id="electiveSubjects" className="subject-group">
            <legend>Elective Subjects</legend>
            {programElectives[programme]?.map((subject) => (
              <div key={subject}>
                <input
                  type="checkbox"
                  id={subject.toLowerCase().replace(/\s+/g, "-")}
                  name="electiveSubject"
                  value={subject}
                  checked={academicInfo.electiveSubjects.includes(subject)}
                  disabled
                />
                <label htmlFor={subject.toLowerCase().replace(/\s+/g, "-")}>
                  {subject}
                </label>
              </div>
            ))}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
