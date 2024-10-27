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

interface AcademicInfoProps {
  programme: string;
  academicInfo: AcademicData;
  setAcademicData: (
    field: keyof AcademicData,
    value: string | string[]
  ) => void;
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

const initialClassCapacities: ClassCapacities = {
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

export default function AcademicInfo({
  programme,
  academicInfo,
  setAcademicData,
}: AcademicInfoProps) {
  const [selectedClass, setSelectedClass] = useState<string>(
    academicInfo.selectedClass
  );
  const [classCapacity, setClassCapacity] = useState<string>(
    academicInfo.classCapacity
  );
  const [coreSubjects, setCoreSubjects] = useState<string[]>(
    academicInfo.coreSubjects.length > 0
      ? academicInfo.coreSubjects
      : coreSubjectsForAllPrograms
  );
  const [selectedElectives, setSelectedElectives] = useState<string[]>(
    academicInfo.electiveSubjects
  );
  const [classCapacities, setClassCapacities] = useState<ClassCapacities>(
    initialClassCapacities
  );

  useEffect(() => {
    setSelectedClass(academicInfo.selectedClass);
    setClassCapacity(academicInfo.classCapacity);
    setCoreSubjects(
      academicInfo.coreSubjects.length > 0
        ? academicInfo.coreSubjects
        : coreSubjectsForAllPrograms
    );
    setSelectedElectives(academicInfo.electiveSubjects);
  }, [academicInfo]);

  useEffect(() => {
    fetchClassOccupancy();
  }, []);

  const fetchClassOccupancy = async () => {
    try {
      const response = await fetch("/api/class-occupancy");
      const data: ApiResponse = await response.json();

      if (data.occupancy) {
        const updatedCapacities = { ...initialClassCapacities };
        Object.entries(data.occupancy).forEach(([prog, classes]) => {
          if (updatedCapacities[prog]) {
            Object.entries(classes).forEach(([className, occupancy]) => {
              if (updatedCapacities[prog][className] !== undefined) {
                updatedCapacities[prog][className] -= occupancy;
                if (updatedCapacities[prog][className] < 0)
                  updatedCapacities[prog][className] = 0;
              }
            });
          }
        });
        setClassCapacities(updatedCapacities);
      }
    } catch (error) {
      console.error("Error fetching class occupancy:", error);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = e.target.value;
    setSelectedClass(selectedClass);

    const capacity = classCapacities[programme]?.[selectedClass] ?? 0;
    const capacityString =
      capacity > 0 ? `${capacity} seats left` : "Class capacity is full";
    setClassCapacity(capacityString);
    setAcademicData("selectedClass", selectedClass);
    setAcademicData("classCapacity", capacityString);
  };

  const handleElectiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const updatedElectives = selectedElectives.includes(value)
      ? selectedElectives.filter((elective) => elective !== value)
      : [...selectedElectives, value];
    setSelectedElectives(updatedElectives);
    setAcademicData("electiveSubjects", updatedElectives);
  };

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
                  {classCapacities[programme]?.[className] > 0
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
                  checked={selectedElectives.includes(subject)}
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
