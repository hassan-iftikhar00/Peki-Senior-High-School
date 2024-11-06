"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Students from "./components/Students";
import SchoolSettings from "./components/SchoolSettings";
import Actions from "./components/Actions";
import Programmes from "./components/Programmes";
import Classes from "./components/Classes";
import Houses from "./components/Houses";
import Logs from "./components/Logs";
import AdmissionDocuments from "./components/AdmissionDocuments";
import Users from "./components/Users";
import Footer from "./components/Footer";
import "./admin.css";

export default function AdminPanel() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return <Students />;
      case "school-settings":
        return <SchoolSettings />;
      case "actions":
        return <Actions />;
      case "programmes":
        return <Programmes />;
      case "class":
        return <Classes />;
      case "houses":
        return <Houses />;
      case "logs":
        return <Logs />;
      case "admission-document":
        return <AdmissionDocuments />;
      case "users":
        return <Users />;
      default:
        return <div>Welcome to the Dashboard</div>;
    }
  };

  return (
    <div
      className="admin-panel"
      style={{
        display: "grid",
        gridTemplateAreas: `"sidebar header" "sidebar main" "sidebar footer"`,
        gridTemplateColumns: `${isSidebarOpen ? "280px" : "0"} 1fr`,
        gridTemplateRows: "64px 1fr 50px",
        minHeight: "100vh",
        transition: "grid-template-columns 0.3s ease",
      }}
    >
      <div style={{ gridArea: "sidebar", position: "relative" }}>
        <div className={`sidebar ${!isSidebarOpen ? "closed" : ""}`}>
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>

      <header style={{ gridArea: "header" }} className="header">
        <Header toggleSidebar={toggleSidebar} />
      </header>

      <main
        style={{
          gridArea: "main",
          overflow: "auto",
          position: "relative",
          backgroundColor: "#f4f6f8",
        }}
      >
        <div className="content-area">{renderContent()}</div>
      </main>

      <footer style={{ gridArea: "footer" }} className="footer">
        <Footer />
      </footer>
    </div>
  );
}
