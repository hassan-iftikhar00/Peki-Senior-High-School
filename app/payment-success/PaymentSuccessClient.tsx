"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<{
    status: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status && message) {
      setPaymentDetails({ status, message });
    }
  }, [searchParams]);

  if (!paymentDetails) {
    return <div>Loading payment details...</div>;
  }

  return (
    <div>
      <h2>Payment {paymentDetails.status}</h2>
      <p>{paymentDetails.message}</p>
    </div>
  );
}
