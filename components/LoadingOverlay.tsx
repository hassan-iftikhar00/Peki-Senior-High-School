"use client";

import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message: string;
  isVisible: boolean;
}

export default function LoadingOverlay({
  message,
  isVisible,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Loader2 className="loading-spinner" />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
