import React from "react";

interface CardProps {
  title: string;
  value: number;
  icon: string;
}

export default function Card({ title, value, icon }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className={`icon icon-${icon}`}></span>
      </div>
      <div className="card-content">
        <p className="card-value">{value}</p>
        <p className="card-description">
          {((value / 1234) * 100).toFixed(1)}% of total students
        </p>
      </div>
    </div>
  );
}
