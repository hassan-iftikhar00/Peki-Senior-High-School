"use client";

import React from "react";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-layout">{children}</div>;
}
