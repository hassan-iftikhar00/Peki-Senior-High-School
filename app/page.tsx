"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VerifyIndexPage from "../components/VerifyIndexPage";
import ApplicantLoginPage from "../components/ApplicantLoginPage";
import EmptyErrorPopup from "../components/EmptyErrorPopup";
import InvalidIndexPopup from "../components/InvalidIndexPopup";
import ApplicantPopup from "../components/ApplicantPopup";
import RecoverLoginPopup from "../components/RecoverLoginPopup";

export default function Home() {
  const [showVerifyIndex, setShowVerifyIndex] = useState(true);
  const [showApplicantLogin, setShowApplicantLogin] = useState(false);
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [showInvalidIndex, setShowInvalidIndex] = useState(false);
  const [showApplicantPopup, setShowApplicantPopup] = useState(false);
  const [showRecoverPopup, setShowRecoverPopup] = useState(false);
  const [verifiedIndexNumber, setVerifiedIndexNumber] = useState("");
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");

  const router = useRouter();

  const handleVerify = async (indexNumber: string) => {
    if (indexNumber.trim() === "") {
      setShowEmptyError(true);
      setTimeout(() => setShowEmptyError(false), 5000);
    } else {
      try {
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ indexNumber }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.verified) {
            setVerifiedIndexNumber(indexNumber);
            setShowApplicantPopup(true);
          } else {
            setShowInvalidIndex(true);
            setTimeout(() => setShowInvalidIndex(false), 5000);
          }
        } else {
          setShowInvalidIndex(true);
          setTimeout(() => setShowInvalidIndex(false), 5000);
        }
      } catch (error) {
        console.error("Error verifying index number:", error);
        setShowInvalidIndex(true);
        setTimeout(() => setShowInvalidIndex(false), 5000);
      }
    }
  };

  const handleBuyVoucher = async (phoneNumber: string) => {
    setVerifiedPhoneNumber(phoneNumber);
    const formattedPhoneNumber = `+233${phoneNumber.slice(1)}`;

    try {
      // Call the payment API
      const paymentResponse = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Payment failed");
      }

      // Call the SMS notification API
      const message = `Your login credentials have been sent to this number.`;
      const smsResponse = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: formattedPhoneNumber, content: message }),
      });

      if (!smsResponse.ok) {
        const errorData = await smsResponse.json();
        if (smsResponse.status === 402) {
          throw new Error(errorData.error);
        } else {
          throw new Error("Failed to send SMS");
        }
      }

      // If both requests are successful
      setShowApplicantPopup(false);
      setShowVerifyIndex(false);
      setShowApplicantLogin(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error during voucher purchase:", error.message);
        alert("Error purchasing voucher: " + error.message);
      } else {
        console.error("An unknown error occurred:", error);
        alert("Error purchasing voucher: An unknown error occurred.");
      }
    }
  };

  const handleRecoverLink = () => {
    setShowRecoverPopup(true);
  };

  const handleRecoverLoad = (indexNumber: string) => {
    if (indexNumber === verifiedIndexNumber) {
      // Simulate loading serial and PIN
      setShowRecoverPopup(false);
      setShowApplicantLogin(true);
    } else {
      alert("Invalid index number or no payment record found.");
    }
  };

  const handleRecoverSend = (indexNumber: string) => {
    if (indexNumber === verifiedIndexNumber) {
      console.log(`Sending login credentials to ${verifiedPhoneNumber}`);
      alert(`Login credentials sent to ${verifiedPhoneNumber}`);
      setShowRecoverPopup(false);
    } else {
      alert("Invalid index number or no payment record found.");
    }
  };

  const handleLogin = (indexNumber: string, pin: string) => {
    // Simulate login process
    if (indexNumber === verifiedIndexNumber && pin === "1234") {
      router.push("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <main>
      {showVerifyIndex && <VerifyIndexPage onVerify={handleVerify} />}
      {showApplicantLogin && (
        <ApplicantLoginPage
          onRecoverLink={handleRecoverLink}
          onLogin={handleLogin}
        />
      )}
      {showEmptyError && <EmptyErrorPopup />}
      {showInvalidIndex && <InvalidIndexPopup />}
      {showApplicantPopup && (
        <ApplicantPopup
          onClose={() => setShowApplicantPopup(false)}
          onBuyVoucher={handleBuyVoucher}
        />
      )}
      {showRecoverPopup && (
        <RecoverLoginPopup
          onClose={() => setShowRecoverPopup(false)}
          onLoad={handleRecoverLoad}
          onSend={handleRecoverSend}
        />
      )}
    </main>
  );
}
