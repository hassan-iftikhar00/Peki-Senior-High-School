import React from "react";

const stats = [
  {
    title: "Total Completed Online",
    value: 1234,
    description: "100% of total students",
    icon: "users",
  },
  {
    title: "Male Students",
    value: 617,
    description: "50.0% of total students",
    icon: "user",
  },
  {
    title: "Female Students",
    value: 617,
    description: "50.0% of total students",
    icon: "user",
  },
  {
    title: "Boarders",
    value: 456,
    description: "37.0% of total students",
    icon: "home",
  },
  {
    title: "Day Students",
    value: 778,
    description: "63.0% of total students",
    icon: "school",
  },
  {
    title: "Total Placed",
    value: 1102,
    description: "89.3% placement rate",
    icon: "key",
  },
  {
    title: "Pending Applicants",
    value: 132,
    description: "10.7% of total applications",
    icon: "file-text",
  },
];

const activities = [
  {
    id: 1,
    user: "Olivia Martin",
    action: "Submitted an application to Peki Senior High School",
    time: "Just now",
  },
  {
    id: 2,
    user: "Olivia Martin",
    action: "Updated personal information",
    time: "Just now",
  },
  {
    id: 3,
    user: "Olivia Martin",
    action: "Submitted an application to Peki Senior High School",
    time: "Just now",
  },
];

// Generate random chart data
const chartData = Array.from(
  { length: 30 },
  () => Math.floor(Math.random() * 80) + 20
);

export default function Dashboard() {
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
            {chartData.map((height, index) => (
              <div
                key={index}
                className="chart-bar"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className="activities-card">
          <div className="activities-header">
            <h3>Recent Activities</h3>
          </div>
          <div className="activities-list">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="activity-content">
                  <p className="activity-user">{activity.user}</p>
                  <p className="activity-action">{activity.action}</p>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
