"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Processing payment...");

  useEffect(() => {
    const checkoutId = searchParams.get("checkoutid");
    const indexNumber = searchParams.get("indexNumber");

    if (checkoutId && indexNumber) {
      updatePaymentStatus(checkoutId, indexNumber);
    } else {
      setMessage("Invalid payment information. Please contact support.");
    }
  }, [router, searchParams]);

  const updatePaymentStatus = async (
    checkoutId: string,
    indexNumber: string
  ) => {
    try {
      const response = await fetch("/api/update-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checkoutId, indexNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Payment successful! Your application fee has been paid.");
        // Send a message to the parent window if it exists
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "PAYMENT_SUCCESS",
              checkoutId: checkoutId,
              indexNumber: indexNumber,
            },
            "*"
          );
          // Close this window after a short delay
          setTimeout(() => window.close(), 3000);
        } else {
          // If there's no opener, redirect to the main application page after a delay
          setTimeout(() => router.push("/"), 3000);
        }
      } else {
        setMessage("Failed to update payment status. Please contact support.");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setMessage("An error occurred. Please contact support.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
        <p className="mb-4">{message}</p>
        <p className="text-sm text-gray-500">
          This window will close automatically or redirect you to the main page.
        </p>
      </div>
    </div>
  );
}
