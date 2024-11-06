import React, { useState } from "react";

const initialHouses = [
  { id: 1, name: "House One - Boys", capacity: 100, occupancy: 90 },
  { id: 2, name: "House Two - Boys", capacity: 100, occupancy: 85 },
  { id: 3, name: "House Three - Boys", capacity: 100, occupancy: 95 },
  { id: 4, name: "House Four - Boys", capacity: 100, occupancy: 88 },
  { id: 5, name: "House One - Girls", capacity: 100, occupancy: 92 },
  { id: 6, name: "House Two - Girls", capacity: 100, occupancy: 87 },
  { id: 7, name: "House Three - Girls", capacity: 100, occupancy: 93 },
  { id: 8, name: "House Four - Girls", capacity: 100, occupancy: 89 },
];

export default function Houses() {
  const [houses, setHouses] = useState(initialHouses);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHouses = houses.filter((house) =>
    house.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inner-content">
      <div className="houses-page">
        <div className="houses-grid">
          {houses.map((house) => (
            <div key={house.id} className="house-stat-card">
              <div className="house-stat-header">
                <span>{house.name}</span>
                <span className="house-icon">🏠</span>
              </div>
              <div className="house-stat-content">
                <div className="occupancy-ratio">
                  {house.occupancy}/{house.capacity}
                </div>
                <div className="occupancy-percentage">
                  {((house.occupancy / house.capacity) * 100).toFixed(1)}%
                  occupancy
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="houses-toolbar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search houses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-button not-admin">
            <span className="plus-icon">+</span> Add House
          </button>
        </div>

        <div className="houses-card">
          <div className="houses-header">
            <h2>Houses</h2>
            <p className="subtitle">Manage your school's houses here.</p>
          </div>

          <table className="houses-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>House Name</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHouses.map((house, index) => (
                <tr key={house.id}>
                  <td>{index + 1}</td>
                  <td>{house.name}</td>
                  <td>{house.capacity}</td>
                  <td>{house.occupancy}</td>
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
            <p>Total number of houses: {filteredHouses.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
