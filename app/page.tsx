"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VerifyIndexPage from "../components/VerifyIndexPage";
import ApplicantLoginPage from "../components/ApplicantLoginPage";
import EmptyErrorPopup from "../components/EmptyErrorPopup";
import InvalidIndexPopup from "../components/InvalidIndexPopup";
import ApplicantPopup from "../components/ApplicantPopup";
import RecoverLoginPopup from "../components/RecoverLoginPopup";

interface CandidateInfo {
  fullName: string;
  indexNumber: string;
  programme: string;
  gender: string;
  residence: string;
  aggregate: number;
}

export default function Home() {
  const [showVerifyIndex, setShowVerifyIndex] = useState(true);
  const [showApplicantLogin, setShowApplicantLogin] = useState(false);
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [showInvalidIndex, setShowInvalidIndex] = useState(false);
  const [showApplicantPopup, setShowApplicantPopup] = useState(false);
  const [showRecoverPopup, setShowRecoverPopup] = useState(false);
  const [verifiedIndexNumber, setVerifiedIndexNumber] = useState("");
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState("");
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [recoveredSerial, setRecoveredSerial] = useState("");
  const [recoveredPin, setRecoveredPin] = useState("");

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      );
      if (token) {
        try {
          const response = await fetch("/api/verify-token", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            router.push("/dashboard");
          } else {
            document.cookie =
              "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        } catch (error) {
          console.error("Error verifying token:", error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleVerify = async (indexNumber: string) => {
    if (indexNumber.trim() === "") {
      setShowEmptyError(true);
      setTimeout(() => setShowEmptyError(false), 5000);
      return;
    }

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ indexNumber }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setVerifiedIndexNumber(indexNumber);
        setCandidateInfo(data.candidateInfo);
        setShowApplicantPopup(true);
        setShowVerifyIndex(false);
      } else {
        setShowInvalidIndex(true);
        setTimeout(() => setShowInvalidIndex(false), 5000);
      }
    } catch (error) {
      console.error("Error verifying index number:", error);
      setShowInvalidIndex(true);
      setTimeout(() => setShowInvalidIndex(false), 5000);
    }
  };

  const handleLogin = async (serial: string, pin: string) => {
    try {
      console.log("Attempting login...");
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial, pin }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Login successful, received token:", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        console.log("Token set in cookie:", document.cookie);
        localStorage.setItem("token", data.token);
        console.log("Token stored in localStorage");
        setTimeout(() => {
          console.log("Redirecting to dashboard...");
          router.push("/dashboard");
        }, 1000);
      } else {
        console.error("Login failed:", data.error);
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    }
  };

  const showLogin = () => {
    setShowApplicantLogin(true);
    setShowVerifyIndex(false);
    setShowApplicantPopup(false);
  };

  const handleRecoverLink = () => {
    setShowRecoverPopup(true);
  };

  const handleBuyVoucher = async (phoneNumber: string) => {
    setVerifiedPhoneNumber(phoneNumber);
    try {
      const response = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, indexNumber: verifiedIndexNumber }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("An error occurred while initiating payment. Please try again.");
    }
  };

  const handleRecoverLoad = useCallback(async (indexNumber: string) => {
    console.log("Recover load called with index number:", indexNumber);
    try {
      const response = await fetch(`/api/recover?indexNumber=${indexNumber}`);
      const data = await response.json();

      if (data.success) {
        setRecoveredSerial(data.serialNumber);
        setRecoveredPin(data.pin);
        setShowRecoverPopup(false);
        setShowApplicantLogin(true);
        return { serialNumber: data.serialNumber, pin: data.pin };
      } else {
        console.error("Failed to recover login information:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error recovering login info:", error);
      return null;
    }
  }, []);

  const handleRecoverSend = useCallback(async (indexNumber: string) => {
    console.log("Recover send called with index number:", indexNumber);
    try {
      const response = await fetch("/api/send-recovered-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ indexNumber }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);

      if (result.success) {
        console.log("Login information sent successfully");
        setShowRecoverPopup(false);
        setShowApplicantLogin(true);
      } else {
        console.error("Failed to send login information:", result.error);
      }
    } catch (error) {
      console.error("Error sending recovered login info:", error);
    }
  }, []);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main>
      {showVerifyIndex && <VerifyIndexPage onVerify={handleVerify} />}
      {showApplicantLogin && (
        <ApplicantLoginPage
          onRecoverLink={handleRecoverLink}
          onLogin={handleLogin}
          initialSerial={recoveredSerial}
          initialPin={recoveredPin}
        />
      )}
      {showEmptyError && <EmptyErrorPopup />}
      {showInvalidIndex && <InvalidIndexPopup />}
      {showApplicantPopup && candidateInfo && (
        <ApplicantPopup
          onClose={() => {
            setShowApplicantPopup(false);
            setShowVerifyIndex(true);
          }}
          candidateInfo={candidateInfo}
          showLogin={showLogin}
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
