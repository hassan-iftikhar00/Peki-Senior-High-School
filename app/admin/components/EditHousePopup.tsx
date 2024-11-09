import React, { useState, useEffect } from "react";

interface House {
  _id: string;
  name: string;
  gender: "Male" | "Female";
  capacity: number;
  currentOccupancy: number;
}

interface EditHousePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onEditHouse: (updatedHouse: House) => Promise<void>;
  house: House | null;
}

export default function EditHousePopup({
  isOpen,
  onClose,
  onEditHouse,
  house,
}: EditHousePopupProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [capacity, setCapacity] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (house) {
      setName(house.name);
      setGender(house.gender);
      setCapacity(house.capacity);
    }
  }, [house]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!house) return;

    setError("");
    setIsLoading(true);

    try {
      await onEditHouse({
        ...house,
        name,
        gender,
        capacity,
      });
      onClose();
    } catch (err) {
      setError("Failed to update house. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !house) return null;

  return (
    <div className="house-popup-overlay">
      <div className="house-popup-content">
        <h2 className="house-popup-title">Edit House</h2>
        <form onSubmit={handleSubmit}>
          <div className="house-form-group">
            <label htmlFor="house-name">House Name</label>
            <input
              type="text"
              id="house-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="house-form-input"
              required
            />
          </div>
          <div className="house-form-group">
            <label htmlFor="house-gender">Gender</label>
            <select
              id="house-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as "Male" | "Female")}
              className="house-form-select"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="house-form-group">
            <label htmlFor="house-capacity">Capacity</label>
            <input
              type="number"
              id="house-capacity"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="house-form-input"
              required
              min="1"
            />
          </div>
          {error && <p className="house-error-message">{error}</p>}
          <div className="house-button-group">
            <button
              type="button"
              onClick={onClose}
              className="house-button house-secondary-button not-admin"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="house-button house-primary-button not-admin"
            >
              {isLoading ? "Updating..." : "Update House"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
