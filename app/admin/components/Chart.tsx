import React from "react";

interface ChartProps {
  title: string;
}

export default function Chart({ title }: ChartProps) {
  return (
    <div className="chart">
      <h3>{title}</h3>
      <div className="chart-placeholder">
        {/* Replace this with an actual chart implementation */}
        <p>Chart goes here</p>
      </div>
    </div>
  );
}
