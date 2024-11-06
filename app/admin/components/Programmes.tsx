import React, { useState } from "react";

const initialProgrammes = [
  { id: 1, name: "Science", color: "green" },
  { id: 2, name: "Arts", color: "purple" },
  { id: 3, name: "Business", color: "brown" },
];

export default function Programmes() {
  const [programmes, setProgrammes] = useState(initialProgrammes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProgrammes = programmes.filter((programme) =>
    programme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inner-content">
      <div className="programmes-page">
        <div className="programmes-toolbar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search programmes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-button not-admin">
            <span className="plus-icon">+</span> Add Programme
          </button>
        </div>

        <div className="programmes-card">
          <div className="programmes-header">
            <h2>Programmes</h2>
            <p className="subtitle">Manage your school's programmes here.</p>
          </div>

          <table className="programmes-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Programme</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgrammes.map((programme, index) => (
                <tr key={programme.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className={`programme-name ${programme.color}`}>
                      {programme.name}
                    </span>
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
            <p>Total number of programmes: {filteredProgrammes.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
