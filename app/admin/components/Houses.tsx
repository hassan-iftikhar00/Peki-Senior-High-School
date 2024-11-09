"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";
import AddHousePopup from "./AddHousePopup";
import EditHousePopup from "./EditHousePopup";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";

interface House {
  _id: string;
  name: string;
  gender: "Male" | "Female";
  capacity: number;
  currentOccupancy: number;
}

export default function Houses() {
  const [houses, setHouses] = useState<House[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [housesPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof House>("gender");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [genderFilter, setGenderFilter] = useState<"All" | "Male" | "Female">(
    "All"
  );
  const [isAddHousePopupOpen, setIsAddHousePopupOpen] = useState(false);
  const [isEditHousePopupOpen, setIsEditHousePopupOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchHouses();
  }, [currentPage, sortField, sortDirection, genderFilter]);

  const fetchHouses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/houses?page=${currentPage}&limit=${housesPerPage}&sort=${sortField}&direction=${sortDirection}&gender=${genderFilter}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch houses");
      }
      const data = await response.json();
      setHouses(data.houses);
    } catch (err) {
      setError("Failed to load houses. Please try again later.");
      console.error("Error fetching houses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHouse = async (house: {
    name: string;
    gender: "Male" | "Female";
    capacity: number;
  }) => {
    try {
      const response = await fetch("/api/admin/houses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(house),
      });

      if (!response.ok) {
        throw new Error("Failed to add house");
      }

      await fetchHouses();
    } catch (err) {
      console.error("Error adding house:", err);
      throw err;
    }
  };

  const handleEditHouse = (house: House) => {
    setSelectedHouse(house);
    setIsEditHousePopupOpen(true);
  };

  const handleUpdateHouse = async (updatedHouse: House) => {
    try {
      const response = await fetch(`/api/admin/houses`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedHouse),
      });

      if (!response.ok) {
        throw new Error("Failed to update house");
      }

      await fetchHouses();
      setIsEditHousePopupOpen(false);
    } catch (err) {
      console.error("Error updating house:", err);
      alert("Failed to update house. Please try again.");
    }
  };

  const handleDeleteClick = (house: House) => {
    setSelectedHouse(house);
    setIsDeleteConfirmationOpen(true);
  };

  const handleDeleteHouse = async () => {
    if (!selectedHouse) return;

    try {
      const response = await fetch(`/api/admin/houses`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ _id: selectedHouse._id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete house");
      }
      await fetchHouses();
      setIsDeleteConfirmationOpen(false);
    } catch (err) {
      console.error("Error deleting house:", err);
      alert("Failed to delete house. Please try again.");
    }
  };

  const handleSort = (field: keyof House) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredHouses = houses.filter(
    (house) =>
      house.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (genderFilter === "All" || house.gender === genderFilter)
  );

  const totalPages = Math.ceil(filteredHouses.length / housesPerPage);

  return (
    <div className="inner-content">
      <div className="houses-page">
        <div className="houses-grid">
          {houses.map((house) => (
            <div key={house._id} className="house-stat-card">
              <div className="house-stat-header">
                <span>{house.name}</span>
                <span className="house-icon">🏠</span>
              </div>
              <div className="house-stat-content">
                <div className="occupancy-ratio">
                  {house.currentOccupancy}/{house.capacity}
                </div>
                <div className="occupancy-percentage">
                  {((house.currentOccupancy / house.capacity) * 100).toFixed(1)}
                  % occupancy
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="houses-toolbar">
          <div className="houses-toolbar-left">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search houses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={genderFilter}
              onChange={(e) =>
                setGenderFilter(e.target.value as "All" | "Male" | "Female")
              }
              className="gender-filter"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <button
            className="add-button not-admin"
            onClick={() => setIsAddHousePopupOpen(true)}
          >
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
                <th onClick={() => handleSort("name")}>
                  House Name{" "}
                  {sortField === "name" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("gender")}>
                  Gender{" "}
                  {sortField === "gender" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("capacity")}>
                  Capacity{" "}
                  {sortField === "capacity" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("currentOccupancy")}>
                  Occupancy{" "}
                  {sortField === "currentOccupancy" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHouses.map((house, index) => (
                <tr key={house._id}>
                  <td>{(currentPage - 1) * housesPerPage + index + 1}</td>
                  <td>{house.name}</td>
                  <td>{house.gender}</td>
                  <td>{house.capacity}</td>
                  <td>{house.currentOccupancy}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit-icon not-admin"
                        title="Edit"
                        onClick={() => handleEditHouse(house)}
                      >
                        ✎
                      </button>
                      <button
                        className="icon-button delete-icon not-admin"
                        title="Delete"
                        onClick={() => handleDeleteClick(house)}
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
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button not-admin"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="pagination-info">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-button not-admin"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <LoadingOverlay message="Loading houses..." isVisible={isLoading} />
      <AddHousePopup
        isOpen={isAddHousePopupOpen}
        onClose={() => setIsAddHousePopupOpen(false)}
        onAddHouse={handleAddHouse}
      />
      <EditHousePopup
        isOpen={isEditHousePopupOpen}
        onClose={() => setIsEditHousePopupOpen(false)}
        onEditHouse={handleUpdateHouse}
        house={selectedHouse}
      />
      <DeleteConfirmationPopup
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={handleDeleteHouse}
        itemName={selectedHouse?.name || ""}
      />
    </div>
  );
}
