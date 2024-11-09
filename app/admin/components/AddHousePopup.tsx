import React, { useState } from "react";

interface AddHousePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHouse: (house: {
    name: string;
    gender: "Male" | "Female";
    capacity: number;
  }) => Promise<void>;
}

export default function AddHousePopup({
  isOpen,
  onClose,
  onAddHouse,
}: AddHousePopupProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [capacity, setCapacity] = useState(400);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onAddHouse({ name, gender, capacity });
      onClose();
    } catch (err) {
      setError("Failed to add house. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="house-popup-overlay">
      <div className="house-popup-content">
        <h2 className="house-popup-title">Add New House</h2>
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
              {isLoading ? "Adding..." : "Add House"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
