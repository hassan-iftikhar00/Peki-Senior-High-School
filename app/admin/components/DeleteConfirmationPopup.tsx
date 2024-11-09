import React from "react";

interface DeleteConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function DeleteConfirmationPopup({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="house-popup-overlay">
      <div className="house-popup-content">
        <h2 className="house-popup-title">Confirm Deletion</h2>
        <p>Are you sure you want to delete the house "{itemName}"?</p>
        <div className="house-button-group">
          <button
            onClick={onClose}
            className="house-button house-secondary-button not-admin"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="house-button house-primary-button not-admin"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
