import React, { useState } from "react";

const initialClasses = [
  {
    id: 1,
    name: "Class 1A",
    programme: { name: "Science", color: "green" },
    capacity: 40,
    occupancy: 35,
    electiveSubjects: ["Physics", "Chemistry"],
  },
  {
    id: 2,
    name: "Class 1B",
    programme: { name: "Arts", color: "purple" },
    capacity: 35,
    occupancy: 30,
    electiveSubjects: ["Literature", "History"],
  },
  {
    id: 3,
    name: "Class 2A",
    programme: { name: "Business", color: "brown" },
    capacity: 38,
    occupancy: 36,
    electiveSubjects: ["Accounting", "Economics"],
  },
];

export default function Classes() {
  const [classes, setClasses] = useState(initialClasses);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClasses = classes.filter((cls) =>
    Object.values(cls).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="inner-content">
      <div className="classes-page">
        <div className="classes-toolbar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search classes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-button not-admin">
            <span className="plus-icon">+</span> Add Class
          </button>
        </div>

        <div className="classes-card">
          <div className="classes-header">
            <h2>Classes</h2>
            <p className="subtitle">Manage your school's classes here.</p>
          </div>

          <table className="classes-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Class</th>
                <th>Programme</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Elective Subjects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls, index) => (
                <tr key={cls.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="class-name">{cls.name}</span>
                  </td>
                  <td>
                    <span className={`programme-name ${cls.programme.color}`}>
                      {cls.programme.name}
                    </span>
                  </td>
                  <td>{cls.capacity}</td>
                  <td>{cls.occupancy}</td>
                  <td>
                    <div className="elective-subjects">
                      {cls.electiveSubjects.map((subject, i) => (
                        <React.Fragment key={subject}>
                          <span className="subject-name">{subject}</span>
                          {i < cls.electiveSubjects.length - 1 && ", "}
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit-icon not-admin"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="icon-button delete-icon not-admin"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-footer">
            <p>Total number of classes: {filteredClasses.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
