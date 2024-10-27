"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("checkoutid");
    setCheckoutId(id);

    if (id) {
      try {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "PAYMENT_SUCCESS",
              checkoutId: id,
            },
            "*"
          );
        }
        setTimeout(() => {
          try {
            window.close();
          } catch (closeError) {
            console.error("Failed to close window:", closeError);
            router.push("/");
          }
        }, 3000);
      } catch (postMessageError) {
        console.error("Failed to send postMessage:", postMessageError);
        setError(
          "An error occurred while processing your payment. Please contact support."
        );
      }
    } else {
      router.push("/");
    }
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
        <p className="mb-4">Your payment has been processed successfully.</p>
        {checkoutId ? (
          <p className="text-sm text-gray-500">
            This window will close automatically.
          </p>
        ) : (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <p className="text-sm text-gray-500">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}
