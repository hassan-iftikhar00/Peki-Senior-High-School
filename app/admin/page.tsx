"use client";

import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
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
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="admin-panel">
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-container">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main
          className={`content-area ${isSidebarOpen ? "" : "sidebar-closed"}`}
        >
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
}
