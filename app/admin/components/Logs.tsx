import React, { useState } from "react";

const initialAdminLogs = [
  {
    id: 1,
    name: "John Doe",
    timeIn: "2024-10-26 09:00:00",
    activityDetails: "Logged in",
    timeOut: "2024-10-26 17:00:00",
  },
  {
    id: 2,
    name: "Jane Smith",
    timeIn: "2024-10-26 08:30:00",
    activityDetails: "Updated student records",
    timeOut: "2024-10-26 16:30:00",
  },
  {
    id: 3,
    name: "Bob Johnson",
    timeIn: "2024-10-26 09:15:00",
    activityDetails: "Generated admission documents",
    timeOut: "2024-10-26 17:15:00",
  },
];

const initialApplicantLogs = [
  {
    id: 1,
    name: "Alice Brown",
    timeIn: "2024-10-26 10:00:00",
    activityDetails: "Submitted application",
    timeOut: "2024-10-26 10:30:00",
  },
  {
    id: 2,
    name: "Charlie Davis",
    timeIn: "2024-10-26 11:15:00",
    activityDetails: "Uploaded documents",
    timeOut: "2024-10-26 11:45:00",
  },
  {
    id: 3,
    name: "Eva Green",
    timeIn: "2024-10-26 14:00:00",
    activityDetails: "Completed online form",
    timeOut: "2024-10-26 14:30:00",
  },
];

export default function Logs() {
  const [adminLogs] = useState(initialAdminLogs);
  const [applicantLogs] = useState(initialApplicantLogs);

  return (
    <div className="inner-content">
      {" "}
      <div className="logs-page">
        <div className="logs-section">
          <div className="logs-card">
            <div className="logs-header">
              <h2>Admin Logs</h2>
              <p className="subtitle">View system logs for admin activities.</p>
            </div>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Name</th>
                  <th>Time In</th>
                  <th>Activity Details</th>
                  <th>Time Out</th>
                </tr>
              </thead>
              <tbody>
                {adminLogs.map((log, index) => (
                  <tr key={log.id}>
                    <td>{index + 1}</td>
                    <td>{log.name}</td>
                    <td>{log.timeIn}</td>
                    <td>
                      <span className="activity-text">
                        {log.activityDetails}
                      </span>
                    </td>
                    <td>{log.timeOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <p>Total admin logs: {adminLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="logs-section">
          <div className="logs-card">
            <div className="logs-header">
              <h2>Applicant Logs</h2>
              <p className="subtitle">View logs for applicant activities.</p>
            </div>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Name</th>
                  <th>Time In</th>
                  <th>Activity Details</th>
                  <th>Time Out</th>
                </tr>
              </thead>
              <tbody>
                {applicantLogs.map((log, index) => (
                  <tr key={log.id}>
                    <td>{index + 1}</td>
                    <td>{log.name}</td>
                    <td>{log.timeIn}</td>
                    <td>
                      <span className="activity-text">
                        {log.activityDetails}
                      </span>
                    </td>
                    <td>{log.timeOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <p>Total applicant logs: {applicantLogs.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
