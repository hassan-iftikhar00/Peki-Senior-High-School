"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Programme {
  _id: string;
  name: string;
}

interface Class {
  _id: string;
  name: string;
  programme: Programme | string;
  capacity: number;
  occupancy: number;
  electiveSubjects: string[];
}

export default function Classes() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchProgrammes();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes");
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }
      const data = await response.json();
      setClasses(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Failed to load classes. Please try again later.");
      setIsLoading(false);
    }
  };

  const fetchProgrammes = async () => {
    try {
      const response = await fetch("/api/admin/programmes");
      if (!response.ok) {
        throw new Error("Failed to fetch programmes");
      }
      const data = await response.json();
      setProgrammes(data);
    } catch (error) {
      console.error("Error fetching programmes:", error);
      setError("Failed to load programmes. Please try again later.");
    }
  };

  const handleAddClass = async (newClass: Omit<Class, "_id">) => {
    try {
      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add class");
      }

      const addedClass = await response.json();
      setClasses([...classes, addedClass]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding class:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add class. Please try again."
      );
    }
  };

  const handleEditClass = async (updatedClass: Class) => {
    try {
      const response = await fetch("/api/admin/classes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedClass),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update class");
      }

      const updatedClassData = await response.json();
      setClasses(
        classes.map((c) =>
          c._id === updatedClassData._id ? updatedClassData : c
        )
      );
      setIsEditModalOpen(false);
      setCurrentClass(null);
    } catch (error) {
      console.error("Error updating class:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update class. Please try again."
      );
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      const response = await fetch("/api/admin/classes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete class");
      }

      setClasses(classes.filter((c) => c._id !== id));
      setIsDeleteModalOpen(false);
      setCurrentClass(null);
    } catch (error) {
      console.error("Error deleting class:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete class. Please try again."
      );
    }
  };

  const getProgrammeName = (programme: Programme | string): string => {
    if (typeof programme === "string") {
      const foundProgramme = programmes.find((p) => p._id === programme);
      return foundProgramme ? foundProgramme.name : "Unknown Programme";
    }
    return programme.name;
  };

  const filteredClasses = classes.filter((cls) =>
    Object.values(cls).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) return <div>Loading classes...</div>;
  if (error) return <div>Error: {error}</div>;

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
          <button
            className="add-button not-admin"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Class
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
                <tr key={cls._id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="class-name">{cls.name}</span>
                  </td>
                  <td>
                    <span className="programme-name">
                      {getProgrammeName(cls.programme)}
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
                        onClick={() => {
                          setCurrentClass(cls);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="icon-button delete-icon not-admin"
                        title="Delete"
                        onClick={() => {
                          setCurrentClass(cls);
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
            <p>Total number of classes: {filteredClasses.length}</p>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddClassModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddClass}
          programmes={programmes}
        />
      )}

      {isEditModalOpen && currentClass && (
        <EditClassModal
          class={currentClass}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentClass(null);
          }}
          onSave={handleEditClass}
          programmes={programmes}
        />
      )}

      {isDeleteModalOpen && currentClass && (
        <DeleteConfirmationModal
          class={currentClass}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCurrentClass(null);
          }}
          onConfirm={() => handleDeleteClass(currentClass._id)}
        />
      )}
    </div>
  );
}

interface AddClassModalProps {
  onClose: () => void;
  onAdd: (newClass: Omit<Class, "_id">) => void;
  programmes: Programme[];
}

function AddClassModal({ onClose, onAdd, programmes }: AddClassModalProps) {
  const [name, setName] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [electiveSubjects, setElectiveSubjects] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProgramme = programmes.find((p) => p._id === programmeId);
    if (!selectedProgramme) return;
    onAdd({
      name,
      programme: selectedProgramme,
      capacity: parseInt(capacity),
      occupancy: parseInt(occupancy),
      electiveSubjects: electiveSubjects
        .split(",")
        .map((subject) => subject.trim()),
    });
  };

  return (
    <div className="classes-modal-overlay">
      <div className="classes-modal-content">
        <div className="classes-modal-header">
          <h3>Add New Class</h3>
          <button onClick={onClose} className="classes-close-button not-admin">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="classes-modal-form">
          <div className="classes-form-group">
            <label htmlFor="className">Class Name</label>
            <input
              type="text"
              id="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-group">
            <label htmlFor="programme">Programme</label>
            <select
              id="programme"
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              required
              className="classes-form-input"
            >
              <option value="">Select a programme</option>
              {programmes.map((programme) => (
                <option key={programme._id} value={programme._id}>
                  {programme.name}
                </option>
              ))}
            </select>
          </div>
          <div className="classes-form-group">
            <label htmlFor="capacity">Capacity</label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-group">
            <label htmlFor="occupancy">Occupancy</label>
            <input
              type="number"
              id="occupancy"
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-group">
            <label htmlFor="electiveSubjects">
              Elective Subjects (comma-separated)
            </label>
            <input
              type="text"
              id="electiveSubjects"
              value={electiveSubjects}
              onChange={(e) => setElectiveSubjects(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-footer">
            <button
              type="button"
              onClick={onClose}
              className="classes-cancel-button not-admin"
            >
              Cancel
            </button>
            <button type="submit" className="classes-submit-button not-admin">
              Add Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditClassModalProps {
  class: Class;
  onClose: () => void;
  onSave: (updatedClass: Class) => void;
  programmes: Programme[];
}

function EditClassModal({
  class: classToEdit,
  onClose,
  onSave,
  programmes,
}: EditClassModalProps) {
  const [name, setName] = useState(classToEdit.name);
  const [programmeId, setProgrammeId] = useState(
    typeof classToEdit.programme === "string"
      ? classToEdit.programme
      : classToEdit.programme._id
  );
  const [capacity, setCapacity] = useState(classToEdit.capacity.toString());
  const [occupancy, setOccupancy] = useState(classToEdit.occupancy.toString());
  const [electiveSubjects, setElectiveSubjects] = useState(
    classToEdit.electiveSubjects.join(", ")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProgramme = programmes.find((p) => p._id === programmeId);
    if (!selectedProgramme) return;
    onSave({
      ...classToEdit,
      name,
      programme: selectedProgramme,
      capacity: parseInt(capacity),
      occupancy: parseInt(occupancy),
      electiveSubjects: electiveSubjects
        .split(",")
        .map((subject) => subject.trim()),
    });
  };

  return (
    <div className="classes-modal-overlay">
      <div className="classes-modal-content">
        <div className="classes-modal-header">
          <h3>Edit Class</h3>
          <button onClick={onClose} className="classes-close-button not-admin">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="classes-modal-form">
          <div className="classes-form-group">
            <label htmlFor="className">Class Name</label>
            <input
              type="text"
              id="className"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-group">
            <label htmlFor="programme">Programme</label>
            <select
              id="programme"
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              required
              className="classes-form-input"
            >
              {programmes.map((programme) => (
                <option key={programme._id} value={programme._id}>
                  {programme.name}
                </option>
              ))}
            </select>
          </div>
          <div className="classes-form-group">
            <label htmlFor="capacity">Capacity</label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-group">
            <label htmlFor="occupancy">Occupancy</label>
            <input
              type="number"
              id="occupancy"
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-group">
            <label htmlFor="electiveSubjects">
              Elective Subjects (comma-separated)
            </label>
            <input
              type="text"
              id="electiveSubjects"
              value={electiveSubjects}
              onChange={(e) => setElectiveSubjects(e.target.value)}
              required
              className="classes-form-input"
            />
          </div>
          <div className="classes-form-footer">
            <button
              type="button"
              onClick={onClose}
              className="classes-cancel-button not-admin"
            >
              Cancel
            </button>
            <button type="submit" className="classes-submit-button not-admin">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmationModalProps {
  class: Class;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({
  class: classToDelete,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className="classes-modal-overlay">
      <div className="classes-modal-content">
        <div className="classes-modal-header">
          <h3>Delete Class</h3>
          <button onClick={onClose} className="classes-close-button not-admin">
            ×
          </button>
        </div>
        <p>Are you sure you want to delete the class "{classToDelete.name}"?</p>
        <div className="classes-form-footer">
          <button onClick={onClose} className="classes-cancel-button not-admin">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="classes-delete-button not-admin"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
