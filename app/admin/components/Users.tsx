"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  lastLogin?: Date;
}

interface NewUser extends Omit<User, "_id"> {
  password: string;
}
interface UserWithPassword extends User {
  password?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleAddUser = async (newUser: NewUser) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error === "Email already registered"
        ) {
          return { emailError: "This email is already registered" };
        }
        throw new Error(data.error || "Failed to add user");
      }

      setUsers([...users, data]);
      setIsAddModalOpen(false);
      return null;
    } catch (error) {
      console.error("Error adding user:", error);
      return {
        generalError:
          error instanceof Error
            ? error.message
            : "Failed to add user. Please try again.",
      };
    }
  };

  const handleEditUser = async (updatedUser: UserWithPassword) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      const updatedUserData = await response.json();
      setUsers(
        users.map((u) => (u._id === updatedUserData._id ? updatedUserData : u))
      );
      setIsEditModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update user. Please try again."
      );
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      setUsers(users.filter((u) => u._id !== id));
      setIsDeleteModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete user. Please try again."
      );
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="inner-content">
      <div className="users-page">
        <div className="users-card">
          <div className="users-header">
            <h2>Users</h2>
            <p className="subtitle">Manage system users and their roles.</p>
          </div>

          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>
                    <a href={`mailto:${user.email}`} className="email-link">
                      {user.email}
                    </a>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Never"}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit-icon not-admin"
                        title="Edit"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="icon-button delete-icon not-admin"
                        title="Delete"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-footer">
            <p>Total users: {users.length}</p>
          </div>
        </div>

        <button
          className="add-user-button not-admin"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddUser}
        />
      )}

      {isEditModalOpen && currentUser && (
        <EditUserModal
          user={currentUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentUser(null);
          }}
          onSave={handleEditUser}
        />
      )}

      {isDeleteModalOpen && currentUser && (
        <DeleteConfirmationModal
          user={currentUser}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCurrentUser(null);
          }}
          onConfirm={() => handleDeleteUser(currentUser._id)}
        />
      )}
    </div>
  );
}

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (
    newUser: NewUser
  ) => Promise<{ emailError?: string; generalError?: string } | null>;
}

function AddUserModal({ onClose, onAdd }: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ ...errors, password: passwordError });
      return;
    }

    const result = await onAdd({ name, email, password, role });
    if (result) {
      setErrors({
        email: result.emailError,
        general: result.generalError,
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New User</h3>
          <button onClick={onClose} className="close-button not-admin">
            ×
          </button>
        </div>
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({
                    ...errors,
                    password: validatePassword(e.target.value),
                  });
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-button not-admin"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
            <div className="password-hint">
              Password must be at least 8 characters long
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "admin" | "superadmin")
              }
              required
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="form-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button not-admin"
            >
              Cancel
            </button>
            <button type="submit" className="submit-button  not-admin">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: UserWithPassword) => void;
}

function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">(user.role);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string }>({});

  const validatePassword = (value: string) => {
    if (value && value.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }
    const updatedUser: UserWithPassword = { ...user, name, email, role };
    if (password) {
      updatedUser.password = password;
    }
    onSave(updatedUser);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit User</h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              New Password (leave blank to keep current)
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ password: validatePassword(e.target.value) });
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-button  not-admin"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
            <div className="password-hint">
              Password must be at least 8 characters long
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "admin" | "superadmin")
              }
              required
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="form-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-butto not-admin"
            >
              Cancel
            </button>
            <button type="submit" className="submit-button not-admin">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmationModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({
  user,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Delete User</h3>
          <button onClick={onClose} className="close-button not-admin">
            ×
          </button>
        </div>
        <p>Are you sure you want to delete the user "{user.name}"?</p>
        <div className="form-footer">
          <button onClick={onClose} className="cancel-button not-admin">
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-button not-admin">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
