"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function PaymentSuccess() {
  const router = useRouter();
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  useEffect(() => {
    // Use window.location.search to get the query parameters
    const params = new URLSearchParams(window.location.search);
    const id = params.get("checkoutid");
    setCheckoutId(id);

    if (id) {
      // Send a message to the parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "PAYMENT_SUCCESS",
            checkoutId: id,
          },
          "*"
        );
        // Close this window
        window.close();
      }
    } else {
      // If there's no checkoutId, redirect to the home page
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
        <p className="mb-4">Your payment has been processed successfully.</p>
        <p className="text-sm text-gray-500">
          This window will close automatically.
        </p>
        {checkoutId && <p className="mt-4">Checkout ID: {checkoutId}</p>}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}
