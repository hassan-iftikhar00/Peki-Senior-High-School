"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSchoolSettings } from "@/app/contexts/SchoolSettingsContext";

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Processing payment...");
  const [retries, setRetries] = useState(10);
  const [checkInterval, setCheckInterval] = useState(5000);
  const { settings } = useSchoolSettings();

  useEffect(() => {
    const clientReference = searchParams.get("clientReference");
    const indexNumber = searchParams.get("indexNumber");

    if (clientReference && indexNumber) {
      setTimeout(() => checkPaymentStatus(clientReference, indexNumber), 5000);
    } else {
      setMessage("Invalid payment information. Please contact support.");
    }
  }, [searchParams]);

  const checkPaymentStatus = async (
    clientReference: string,
    indexNumber: string
  ) => {
    try {
      const response = await fetch(
        `/api/check-payment-status?clientReference=${clientReference}`
      );
      const data = await response.json();

      if (data.success) {
        setMessage(
          settings.voucherMessage ||
            "Payment successful! Your application fee has been paid."
        );
        setTimeout(() => router.push("/"), 3000);
      } else if (data.status === "pending" && retries > 0) {
        setMessage("Payment is still processing. Please wait...");
        setRetries(retries - 1);
        setCheckInterval((prev) => Math.min(prev * 1.5, 30000));
        setTimeout(
          () => checkPaymentStatus(clientReference, indexNumber),
          checkInterval
        );
      } else if (data.status === "rate_limited" && retries > 0) {
        setMessage("Checking payment status... Please wait.");
        setRetries(retries - 1);
        setTimeout(
          () => checkPaymentStatus(clientReference, indexNumber),
          30000
        );
      } else {
        setMessage(
          data.message ||
            "Payment failed or is still pending. Please try again or contact support."
        );
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      if (retries > 0) {
        setMessage("Error checking payment status. Retrying...");
        setRetries(retries - 1);
        setTimeout(
          () => checkPaymentStatus(clientReference, indexNumber),
          checkInterval
        );
      } else {
        setMessage("An error occurred. Please contact support.");
      }
    }
  };

  return (
    <div className="status-container">
      <div className="status-card">
        <h1 className="status-title">Payment Status</h1>
        <div className="status-messageContainer">
          <p className="status-message">{message}</p>
          {retries > 0 && (
            <p className="status-subMessage">
              Please wait, we're confirming your payment...
            </p>
          )}
        </div>
        <div className="status-loadingIndicator">
          <div className="status-spinner"></div>
        </div>
      </div>
    </div>
  );
}
