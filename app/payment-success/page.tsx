"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkoutid");

  useEffect(() => {
    if (checkoutId) {
      // Send a message to the parent window
      window.opener.postMessage(
        {
          type: "PAYMENT_SUCCESS",
          checkoutId: checkoutId,
        },
        "*"
      );
      // Close this window
      window.close();
    } else {
      // If there's no checkoutId, redirect to the home page
      router.push("/");
    }
  }, [checkoutId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
        <p className="mb-4">Your payment has been processed successfully.</p>
        <p className="text-sm text-gray-500">
          This window will close automatically.
        </p>
      </div>
    </div>
  );
}
