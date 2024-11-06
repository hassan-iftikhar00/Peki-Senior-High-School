import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Teacher" | "Staff";
}

export default function Users() {
  const [users] = useState<User[]>([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Teacher" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Staff" },
  ]);

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
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
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
                    <button className="permissions-button not-admin">
                      View Permissions
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button edit-icon not-admin"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="icon-button delete-icon not-admin"
                        title="Delete"
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

        <button className="add-user-button not-admin">
          <Plus className="h-4 w-4" />
          Add New User
        </button>
      </div>
    </div>
  );
}
