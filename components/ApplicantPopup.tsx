"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CandidateInfo {
  fullName: string;
  indexNumber: string;
  programme: string;
  gender: string;
  residence: string;
  aggregate: number;
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
  const [isPaid, setIsPaid] = useState(false);
  const [clientReference, setClientReference] = useState("");
  const [voucherSent, setVoucherSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

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

  const isPhoneValid = phoneNumber.length === 10 && phoneNumber[0] === "0";

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
          totalAmount: 1, // Set your application fee here
          description: "Peki Senior High School Application Fee",
          clientReference: `PEKI-${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientReference(data.clientReference);

        // Center the payment popup
        const width = 500;
        const height = 600;
        const left = Math.max(0, (window.screen.width - width) / 2);
        const top = Math.max(0, (window.screen.height - height) / 2);

        const paymentWindow = window.open(
          data.checkoutDirectUrl,
          "Payment",
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        if (paymentWindow) {
          paymentWindow.focus();
        } else {
          setError(
            "Popup blocked. Please allow popups for this site and try again."
          );
        }

        // Start checking for payment status
        checkPaymentStatus(data.clientReference);
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

  const checkPaymentStatus = useCallback(async (clientRef: string) => {
    const maxAttempts = 12; // 5 minutes (12 * 25 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        console.log("Max attempts reached. Payment status unknown.");
        setError("Payment status check timed out. Please contact support.");
        return;
      }

      try {
        const response = await fetch(
          `/api/check-payment-status?clientReference=${clientRef}`
        );
        const data = await response.json();

        if (data.success && data.status === "Paid") {
          setIsPaid(true);
          console.log("Payment successful!");
        } else if (data.success && data.status === "Unpaid") {
          attempts++;
          setTimeout(checkStatus, 25000); // Check again after 25 seconds
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        attempts++;
        setTimeout(checkStatus, 25000); // Retry after 25 seconds
      }
    };

    checkStatus();
  }, []);

  const handleGenerateVoucher = async () => {
    if (isPhoneValid && isPaid) {
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
          setSuccessMessage(
            "Voucher generated and sent successfully! Please check your phone for the SMS."
          );
          showLogin();
        } else {
          throw new Error(data.error || "Failed to generate voucher");
        }
      } catch (error: unknown) {
        console.error("Error:", error);

        if (error instanceof Error) {
          setError(
            "An error occurred while generating the voucher. If you have paid, please contact the administrator for assistance."
          );
        } else {
          setError(
            "An unknown error occurred. If you have paid, please contact the administrator for assistance."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Set up event listener for payment callback
    const handlePaymentCallback = (event: MessageEvent) => {
      if (event.data.type === "PAYMENT_SUCCESS") {
        setIsPaid(true);
        console.log("Payment successful!");
      }
    };

    window.addEventListener("message", handlePaymentCallback);

    return () => {
      window.removeEventListener("message", handlePaymentCallback);
    };
  }, []);

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
            <div className="warning-box">
              <p className="warning-text">
                You must pay the application fee to proceed. After payment,
                enter your active phone number to receive login credentials.
              </p>
            </div>
          )}
          {!isPaid && (
            <button
              className="pay-button"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Pay Application Fee"}
            </button>
          )}
          {isPaid && !voucherSent && (
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
          {voucherSent && (
            <p className="success-message">
              Voucher sent successfully! Redirecting to login page...
            </p>
          )}
          <div className="creddiv">
            <p className="cred">
              Already have login credentials?
              <b>
                <a onClick={showLogin} className="credbtn">
                  Click here to login
                </a>
              </b>
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
