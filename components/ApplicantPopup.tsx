"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface CandidateInfo {
  fullName: string;
  indexNumber: string;
  programme: string;
  gender: string;
  residence: string;
  aggregate: number;
  feePaid: boolean;
}

interface ApplicantPopupProps {
  onClose: () => void;
  candidateInfo: CandidateInfo;
  showLogin: () => void;
  onBuyVoucher: (phoneNumber: string) => void;
}

export default function ApplicantPopup({
  onClose,
  candidateInfo,
  showLogin,
  onBuyVoucher,
}: ApplicantPopupProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(candidateInfo.feePaid);
  const [clientReference, setClientReference] = useState("");
  const [voucherSent, setVoucherSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  const router = useRouter();
  const paymentWindowRef = useRef<Window | null>(null);

  const handleBuyVoucher = () => {
    if (phoneNumber.length === 10 && phoneNumber[0] === "0") {
      onBuyVoucher(phoneNumber);
    } else {
      setError("Please enter a valid phone number.");
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 0 && value[0] !== "0") {
      value = "0" + value.slice(1);
    }
    value = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(value);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalAmount: 60,
          description: "Peki Senior High School Application Fee",
          clientReference: `PEKI-${Date.now()}`,
          indexNumber: candidateInfo.indexNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientReference(data.clientReference);

        // Open payment URL in a new window
        const width = 500;
        const height = 600;
        const left = Math.max(0, (window.screen.width - width) / 2);
        const top = Math.max(0, (window.screen.height - height) / 2);

        paymentWindowRef.current = window.open(
          data.checkoutDirectUrl,
          "_blank",
          `width=${width},height=${height},left=${left},top=${top},location=yes,status=yes`
        );

        if (!paymentWindowRef.current) {
          setError(
            "Popup blocked. Please allow popups for this site and try again."
          );
          return;
        }

        // Start polling for payment status
        pollPaymentStatus(data.clientReference);
      } else {
        throw new Error(data.error || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = useCallback(async (clientRef: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    const pollInterval = 5000; // 5 seconds

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setError(
          "Payment status check timed out. Please contact support if you've completed the payment."
        );
        return;
      }

      try {
        const statusResponse = await fetch(
          `/api/check-payment-status?clientReference=${clientRef}`
        );
        const statusData = await statusResponse.json();

        if (statusData.success && statusData.status === "completed") {
          setIsPaid(true);
          setSuccessMessage(
            "Payment successful! Please enter your phone number to receive login credentials."
          );
          if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
            paymentWindowRef.current.close();
          }
          return;
        }

        // If window is closed and payment is not confirmed, stop polling
        if (
          paymentWindowRef.current &&
          paymentWindowRef.current.closed &&
          attempts > 2
        ) {
          const finalCheck = await fetch(
            `/api/check-payment-status?clientReference=${clientRef}`
          );
          const finalStatus = await finalCheck.json();

          if (finalStatus.success && finalStatus.status === "completed") {
            setIsPaid(true);
            setSuccessMessage(
              "Payment successful! Please enter your phone number to receive login credentials."
            );
          } else {
            setError(
              "Payment window closed. Please try again if payment was not completed."
            );
          }
          return;
        }

        attempts++;
        setTimeout(checkStatus, pollInterval);
      } catch (error) {
        console.error("Error checking payment status:", error);
        attempts++;
        setTimeout(checkStatus, pollInterval);
      }
    };

    checkStatus();
  }, []);

  const handleGenerateVoucher = async () => {
    if (!isPhoneValid || !isPaid) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/generate-voucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          indexNumber: candidateInfo.indexNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVoucherSent(true);
        setHasCredentials(true);
        setSuccessMessage(
          "Voucher generated and sent successfully! Please check your phone for the SMS."
        );
        setTimeout(() => {
          showLogin();
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to generate voucher");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? `An error occurred while generating the voucher: ${error.message}`
          : "An unknown error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPaid) return;

    const checkCredentials = async () => {
      try {
        const response = await fetch(
          `/api/check-credentials?indexNumber=${candidateInfo.indexNumber}`
        );
        const data = await response.json();

        if (data.hasCredentials) {
          setHasCredentials(true);
          showLogin();
        }
      } catch (error) {
        console.error("Error checking credentials:", error);
      }
    };

    checkCredentials();
  }, [isPaid, candidateInfo.indexNumber, showLogin]);

  const isPhoneValid = phoneNumber.length === 10 && phoneNumber[0] === "0";

  return (
    <div className="applicant-popup" style={{ display: "flex" }}>
      <div className="popup">
        <div className="popup-header">
          <h2 className="popup-title">Applicant Information</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="popup-content">
          <div className="applicant-info">
            <p>
              <strong>Name: {candidateInfo.fullName}</strong>
            </p>
            <p>Index Number: {candidateInfo.indexNumber}</p>
            <p>Programme: {candidateInfo.programme}</p>
            <p>Gender: {candidateInfo.gender}</p>
            <p>Residence: {candidateInfo.residence}</p>
            <p>Aggregate: {candidateInfo.aggregate}</p>
          </div>
          {error && (
            <div className="error-box">
              <p className="error-text" style={{ color: "red" }}>
                {error}
              </p>
            </div>
          )}
          {successMessage && (
            <div className="success-box">
              <p className="success-text" style={{ color: "green" }}>
                {successMessage}
              </p>
            </div>
          )}
          {!isPaid && (
            <>
              <div className="warning-box">
                <p className="warning-text">
                  You must pay the application fee to proceed. After payment,
                  enter your active phone number to receive login credentials.
                </p>
              </div>
              <button
                className="pay-button"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Pay Application Fee"}
              </button>
            </>
          )}
          {isPaid && !hasCredentials && (
            <>
              <input
                type="tel"
                className="phone-input"
                value={phoneNumber}
                onChange={handlePhoneInput}
                placeholder="Enter phone number here"
                maxLength={10}
              />
              <button
                className={`buy-button ${isPhoneValid ? "active" : ""}`}
                disabled={!isPhoneValid || isLoading}
                onClick={handleGenerateVoucher}
              >
                {isLoading ? "Processing..." : "Generate Voucher"}
              </button>
            </>
          )}
          {isPaid && hasCredentials && (
            <p className="success-message">
              Your login credentials have already been generated. Please check
              your phone or click "Login" to proceed.
            </p>
          )}
          <div className="creddiv">
            <p className="cred">
              {isPaid ? (
                <b>
                  <a onClick={showLogin} className="credbtn">
                    Already have login credentials? Click here to login
                  </a>
                </b>
              ) : (
                "Pay the application fee to receive login credentials."
              )}
            </p>
          </div>
        </div>
        <div className="popup-footer">
          <p className="footer-text">Packets Out LLC (Smart Systems)</p>
        </div>
      </div>
    </div>
  );
}
