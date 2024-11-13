"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Log {
  _id: string;
  name: string;
  timeIn: string;
  activityDetails: string;
  timeOut: string;
}

interface PaginatedLogs {
  logs: Log[];
  totalPages: number;
  currentPage: number;
}

export default function Logs() {
  const [adminLogs, setAdminLogs] = useState<PaginatedLogs>({
    logs: [],
    totalPages: 0,
    currentPage: 1,
  });
  const [candidateLogs, setCandidateLogs] = useState<PaginatedLogs>({
    logs: [],
    totalPages: 0,
    currentPage: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs("admin", 1);
    fetchLogs("candidate", 1);
  }, []);

  const fetchLogs = async (type: "admin" | "candidate", page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/logs?type=${type}&page=${page}`);
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      const data: PaginatedLogs = await response.json();
      if (type === "admin") {
        setAdminLogs(data);
      } else {
        setCandidateLogs(data);
      }
    } catch (error) {
      setError("An error occurred while fetching logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderTable = (
    paginatedLogs: PaginatedLogs,
    title: string,
    type: "admin" | "candidate"
  ) => (
    <div className="log-section">
      <h2>{title}</h2>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Time In</th>
            <th>Activity</th>
            <th>Time Out</th>
          </tr>
        </thead>
        <tbody>
          {paginatedLogs.logs.map((log) => (
            <tr key={log._id}>
              <td>{log.name}</td>
              <td>{format(new Date(log.timeIn), "yyyy-MM-dd HH:mm:ss")}</td>
              <td>
                <span className="activity-tag">{log.activityDetails}</span>
              </td>
              <td>{format(new Date(log.timeOut), "yyyy-MM-dd HH:mm:ss")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => fetchLogs(type, paginatedLogs.currentPage - 1)}
          disabled={paginatedLogs.currentPage === 1}
          className="not-admin logs-button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>
          Page {paginatedLogs.currentPage} of {paginatedLogs.totalPages}
        </span>
        <button
          className="not-admin logs-button"
          onClick={() => fetchLogs(type, paginatedLogs.currentPage + 1)}
          disabled={paginatedLogs.currentPage === paginatedLogs.totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="loading">Loading logs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="logs-container">
      <h1>Activity Logs</h1>
      {renderTable(adminLogs, "Admin Logs", "admin")}
      {renderTable(candidateLogs, "Candidate Logs", "candidate")}
    </div>
  );
}
