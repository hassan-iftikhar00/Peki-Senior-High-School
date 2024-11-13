"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Programme {
  _id: string;
  name: string;
}

export default function Programmes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProgramme, setCurrentProgramme] = useState<Programme | null>(
    null
  );

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const response = await fetch("/api/admin/programmes");
      if (!response.ok) {
        throw new Error("Failed to fetch programmes");
      }
      const data = await response.json();
      setProgrammes(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching programmes:", error);
      setError("Failed to load programmes. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleAddProgramme = async (newProgramme: Omit<Programme, "_id">) => {
    try {
      const response = await fetch("/api/admin/programmes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProgramme),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add programme");
      }

      const addedProgramme = await response.json();
      setProgrammes([...programmes, addedProgramme]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding programme:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add programme. Please try again."
      );
    }
  };

  const handleEditProgramme = async (updatedProgramme: Programme) => {
    try {
      const response = await fetch("/api/admin/programmes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProgramme),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update programme");
      }

      const updatedProgrammeData = await response.json();
      setProgrammes(
        programmes.map((p) =>
          p._id === updatedProgrammeData._id ? updatedProgrammeData : p
        )
      );
      setIsEditModalOpen(false);
      setCurrentProgramme(null);
    } catch (error) {
      console.error("Error updating programme:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update programme. Please try again."
      );
    }
  };

  const handleDeleteProgramme = async (id: string) => {
    try {
      const response = await fetch("/api/admin/programmes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete programme");
      }

      setProgrammes(programmes.filter((p) => p._id !== id));
      setIsDeleteModalOpen(false);
      setCurrentProgramme(null);
    } catch (error) {
      console.error("Error deleting programme:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete programme. Please try again."
      );
    }
  };

  const filteredProgrammes = programmes.filter((programme) =>
    programme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading programmes...</div>;
  if (error) return <div>Error: {error}</div>;

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
          <button
            className="add-button not-admin"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Programme
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
                <tr key={programme._id}>
                  <td>{index + 1}</td>
                  <td>{programme.name}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit-icon not-admin"
                        title="Edit"
                        onClick={() => {
                          setCurrentProgramme(programme);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="icon-button delete-icon not-admin"
                        title="Delete"
                        onClick={() => {
                          setCurrentProgramme(programme);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
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

      {isAddModalOpen && (
        <AddProgrammeModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProgramme}
        />
      )}

      {isEditModalOpen && currentProgramme && (
        <EditProgrammeModal
          programme={currentProgramme}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentProgramme(null);
          }}
          onSave={handleEditProgramme}
        />
      )}

      {isDeleteModalOpen && currentProgramme && (
        <DeleteConfirmationModal
          programme={currentProgramme}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCurrentProgramme(null);
          }}
          onConfirm={() => handleDeleteProgramme(currentProgramme._id)}
        />
      )}
    </div>
  );
}

interface AddProgrammeModalProps {
  onClose: () => void;
  onAdd: (programme: Omit<Programme, "_id">) => void;
}

function AddProgrammeModal({ onClose, onAdd }: AddProgrammeModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name });
  };

  return (
    <div className="delete-confirmation-modal">
      <div className="add-programme-content">
        <div className="add-programme-header">
          <h3>Add New Programme</h3>
          <button onClick={onClose} className="close-button-add not-admin">
            ×
          </button>
        </div>
        <p className="subtitle">Enter the new programme's information.</p>

        <form onSubmit={handleSubmit} className="add-programme-form">
          <div className="form-group">
            <label htmlFor="programmeName">Programme Name</label>
            <input
              type="text"
              id="programmeName"
              name="programmeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input not-admin-input"
            />
          </div>

          <div className="form-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button not-admin"
            >
              Cancel
            </button>
            <button type="submit" className="add-programme-button not-admin">
              Add Programme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditProgrammeModalProps {
  programme: Programme;
  onClose: () => void;
  onSave: (programme: Programme) => void;
}

function EditProgrammeModal({
  programme,
  onClose,
  onSave,
}: EditProgrammeModalProps) {
  const [name, setName] = useState(programme.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...programme, name });
  };

  return (
    <div className="delete-confirmation-modal">
      <div className="edit-programme-content">
        <div className="edit-programme-header">
          <h3>Edit Programme</h3>
          <button onClick={onClose} className="close-button-add not-admin">
            ×
          </button>
        </div>
        <p className="subtitle">Update the programme's information.</p>

        <form onSubmit={handleSubmit} className="edit-programme-form">
          <div className="form-group">
            <label htmlFor="programmeName">Programme Name</label>
            <input
              type="text"
              id="programmeName"
              name="programmeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input not-admin-input"
            />
          </div>

          <div className="form-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button not-admin"
            >
              Cancel
            </button>
            <button type="submit" className="edit-programme-button not-admin">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmationModalProps {
  programme: Programme;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({
  programme,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className="delete-confirmation-modal">
      <div className="delete-programme-content">
        <div className="delete-programme-header">
          <h3>Delete Programme</h3>
          <button onClick={onClose} className="close-button-add not-admin">
            ×
          </button>
        </div>
        <p className="subtitle">
          Are you sure you want to delete the programme "{programme.name}"?
        </p>

        <div className="form-footer">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button not-admin"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="delete-programme-button not-admin"
          >
            Delete Programme
          </button>
        </div>
      </div>
    </div>
  );
}
