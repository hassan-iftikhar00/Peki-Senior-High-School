"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Processing payment...");
  const [retries, setRetries] = useState(20);
  const [checkInterval, setCheckInterval] = useState(5000);

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
        setMessage("Payment successful! Your application fee has been paid.");
        setTimeout(() => router.push("/"), 3000);
      } else if (data.status === "pending" && retries > 0) {
        setMessage("Payment is still processing. Please wait...");
        setRetries(retries - 1);
        setCheckInterval((prev) => Math.min(prev * 1.5, 30000));
        setTimeout(
          () => checkPaymentStatus(clientReference, indexNumber),
          checkInterval
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
        <p className="mb-4">{message}</p>
        {retries > 0 && (
          <p className="text-sm text-gray-500">
            Please wait, we're confirming your payment...
          </p>
        )}
      </div>
    </div>
  );
}
