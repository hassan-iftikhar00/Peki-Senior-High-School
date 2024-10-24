import { useState, useEffect } from "react";

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

interface ApplicantData {
  academicData: AcademicData;
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

const classCapacities: ClassCapacities = {
  "General Arts": { "Form 1 Arts": 50, "Form 2 Arts": 50, "Form 3 Arts": 50 },
  "General Science": { "G. Sci A": 45, "G. Sci B": 0 },
  Business: {
    "Form 1 Business": 45,
    "Form 2 Business": 45,
    "Form 3 Business": 45,
  },
  "Visual Arts": {
    "Form 1 Visual Arts": 30,
    "Form 2 Visual Arts": 30,
    "Form 3 Visual Arts": 30,
  },
  "Home Economics": {
    "Form 1 Home Economics": 35,
    "Form 2 Home Economics": 35,
    "Form 3 Home Economics": 35,
  },
};

interface AcademicInfoProps {
  programme: string;
  setAcademicData: React.Dispatch<React.SetStateAction<AcademicData>>;
}

export default function AcademicInfo({
  programme,
  setAcademicData,
}: AcademicInfoProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classCapacity, setClassCapacity] = useState<string>("");
  const [coreSubjects, setCoreSubjects] = useState<string[]>([
    "English Language",
    "Core Mathematics",
    "Social Studies",
    "Integrated Science",
  ]);
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);

  useEffect(() => {
    setSelectedClass("");
    setClassCapacity("");
    setSelectedElectives([]);
  }, [programme]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = e.target.value;
    setSelectedClass(selectedClass);

    const capacity =
      classCapacities[programme][
        selectedClass as keyof (typeof classCapacities)[typeof programme]
      ];
    setClassCapacity(
      capacity > 0 ? `${capacity} seats left` : "Class capacity is full"
    );
  };

  const handleElectiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedElectives((prev) =>
      prev.includes(value)
        ? prev.filter((elective) => elective !== value)
        : [...prev, value]
    );
  };

  useEffect(() => {
    setAcademicData({
      selectedClass,
      classCapacity,
      coreSubjects,
      electiveSubjects: selectedElectives,
    });
  }, [
    selectedClass,
    classCapacity,
    coreSubjects,
    selectedElectives,
    setAcademicData,
  ]);

  return (
    <div id="academic" className="section">
      <h2>Academic Information</h2>
      <p className="subtitle headings">
        Provide details about your academic background!
      </p>
      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <label htmlFor="program">
            Program <span className="required">*</span>
          </label>
          <input type="text" id="program" value={programme} required readOnly />
        </div>
        <div className="form-group" style={{ gridColumn: "span 2" }}>
          <label htmlFor="class">
            Class <span className="required">*</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <select
              id="class"
              required
              value={selectedClass}
              onChange={handleClassChange}
              style={{ flexGrow: 1, marginRight: "10px" }}
            >
              <option value="">Select Class</option>
              {programClasses[programme]?.map((className) => (
                <option key={className} value={className}>
                  {className} (
                  {classCapacities[programme][className] > 0
                    ? classCapacities[programme][className] + " seats left"
                    : "Full"}
                  )
                </option>
              ))}
            </select>
            <span
              id="classCapacity"
              style={{
                whiteSpace: "nowrap",
                padding: "5px 10px",
                borderRadius: "4px",
              }}
            >
              {classCapacity}
            </span>
          </div>
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <fieldset id="coreSubjects" className="subject-group">
            <legend>Core Subjects</legend>
            {coreSubjects.map((subject) => (
              <div key={subject}>
                <input
                  type="checkbox"
                  id={subject.toLowerCase().replace(/\s+/g, "-")}
                  name="coreSubject"
                  value={subject}
                  checked
                  readOnly
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
                  onChange={handleElectiveChange}
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
