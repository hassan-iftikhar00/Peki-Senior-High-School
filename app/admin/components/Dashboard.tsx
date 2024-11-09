"use client";

import React, { useState, useEffect } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

// Define types for our data structures
type StatItem = {
  title: string;
  value: number;
  description: string;
  icon: string;
};

type DashboardData = {
  totalCandidates: number;
  totalSubmitted: number;
  maleStudents: number;
  femaleStudents: number;
  boarders: number;
  dayStudents: number;
  completionTrend: number[];
  completedStudents: { fullName: string; applicationNumber: string }[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      title: "Total Completed Online",
      value: 0,
      description: "0% of total students",
      icon: "users",
    },
    {
      title: "Male Students",
      value: 0,
      description: "0% of total completed online",
      icon: "user",
    },
    {
      title: "Female Students",
      value: 0,
      description: "0% of total completed online",
      icon: "user",
    },
    {
      title: "Boarders",
      value: 0,
      description: "0% of total completed online",
      icon: "home",
    },
    {
      title: "Day Students",
      value: 0,
      description: "0% of total completed online",
      icon: "school",
    },
    {
      title: "Total Placed",
      value: 0,
      description: "0% placement rate",
      icon: "key",
    },
    {
      title: "Pending Applicants",
      value: 0,
      description: "0% of total applications",
      icon: "file-text",
    },
  ]);

  const [chartData, setChartData] = useState<
    Array<{ date: Date; count: number }>
  >([]);
  const [completedStudents, setCompletedStudents] = useState<
    { fullName: string; applicationNumber: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/dashboard-stats", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized access to dashboard data");
          // Handle unauthorized access (e.g., redirect to login page)
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const data: DashboardData = await response.json();
      updateStats(data);
      updateChartData(data.completionTrend);
      setCompletedStudents(data.completedStudents);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (data: DashboardData) => {
    const totalStudents = data.totalSubmitted;
    const maleStudents = data.maleStudents;
    const femaleStudents = data.femaleStudents;
    const boarders = data.boarders;
    const dayStudents = data.dayStudents;
    const totalPlaced = data.totalCandidates;
    const pendingApplicants = totalPlaced - totalStudents;

    setStats([
      {
        title: "Total Completed Online",
        value: totalStudents,
        description: `${((totalStudents / totalPlaced) * 100).toFixed(
          1
        )}% of total students`,
        icon: "users",
      },
      {
        title: "Male Students",
        value: maleStudents,
        description: `${((maleStudents / totalStudents) * 100).toFixed(
          1
        )}% of total completed online`,
        icon: "user",
      },
      {
        title: "Female Students",
        value: femaleStudents,
        description: `${((femaleStudents / totalStudents) * 100).toFixed(
          1
        )}% of total completed online`,
        icon: "user",
      },
      {
        title: "Boarders",
        value: boarders,
        description: `${((boarders / totalStudents) * 100).toFixed(
          1
        )}% of total completed online`,
        icon: "home",
      },
      {
        title: "Day Students",
        value: dayStudents,
        description: `${((dayStudents / totalStudents) * 100).toFixed(
          1
        )}% of total completed online`,
        icon: "school",
      },
      {
        title: "Total Placed",
        value: totalPlaced,
        description: `100% placement rate`,
        icon: "key",
      },
      {
        title: "Pending Applicants",
        value: pendingApplicants,
        description: `${((pendingApplicants / totalPlaced) * 100).toFixed(
          1
        )}% of total applications`,
        icon: "file-text",
      },
    ]);
  };

  const updateChartData = (completionTrend: number[]) => {
    const today = new Date();
    const chartData = completionTrend.map((count, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - index));
      return { date, count };
    });
    setChartData(chartData);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatApplicationDate = (applicationNumber: string) => {
    const day = applicationNumber.slice(0, 2);
    const month = applicationNumber.slice(2, 4);
    const year = applicationNumber.slice(4, 6);
    return `${day}/${month}/20${year}`;
  };

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const getBarHeight = (count: number) => {
    if (count === 0) return "2px";
    // Calculate percentage of max, but ensure minimum visible height for non-zero values
    const minHeight = 20; // minimum height in pixels for non-zero values
    const maxHeight = 200; // maximum height in pixels (adjust based on your mock-chart height)
    const height = (count / maxCount) * maxHeight;
    return `${Math.max(height, minHeight)}px`;
  };

  return (
    <div className="inner-content">
      <div className="dashboard">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <h3>{stat.title}</h3>
                <span className={`icon icon-${stat.icon}`}></span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          ))}
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>30 Day Completion Trend</h3>
            <span className="icon icon-activity"></span>
          </div>
          <div className="mock-chart">
            {chartData.map((item, index) => (
              <div key={index} className="chart-bar-container">
                <div
                  className={`chart-bar ${
                    item.count > 0 ? "chart-bar-nonzero" : ""
                  }`}
                  style={{
                    height: getBarHeight(item.count),
                  }}
                >
                  <span className="chart-bar-label">{item.count}</span>
                </div>
                <span className="chart-bar-date">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="activities-card">
          <div className="activities-header">
            <h3>Recently Completed Applications</h3>
          </div>
          <div className="activities-list">
            {completedStudents.map((student, index) => (
              <div key={index} className="activity-item">
                <div className="activity-avatar">
                  {student.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="activity-content">
                  <p className="activity-user">{student.fullName}</p>
                  <p className="activity-action">Completed application</p>
                </div>
                <div className="activity-time">
                  {formatApplicationDate(student.applicationNumber)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <LoadingOverlay message="Loading dashboard..." isVisible={isLoading} />
    </div>
  );
}
