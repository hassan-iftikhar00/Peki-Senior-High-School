"use client";

import { useState, useCallback } from "react";

interface RecoveredCredentials {
  serialNumber: string;
  pin: string;
}

export default function RecoverLoginPopup({
  onClose,
  onLoad,
  onSend,
}: {
  onClose: () => void;
  onLoad: (indexNumber: string) => Promise<RecoveredCredentials | null>;
  onSend: (indexNumber: string) => Promise<void>;
}) {
  const [indexNumber, setIndexNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recoveredCredentials, setRecoveredCredentials] =
    useState<RecoveredCredentials | null>(null);

  const handleIndexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndexNumber(e.target.value.replace(/\D/g, "").slice(0, 12));
  };

  const handleLoad = useCallback(async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      console.log(
        "Attempting to load login info for index number:",
        indexNumber
      );
      const result = await onLoad(indexNumber);
      if (result) {
        setRecoveredCredentials(result);
        setSuccessMessage("Login information retrieved successfully.");
      } else {
        setError("Check your index number and if you have paid the fee!");
      }
    } catch (error) {
      console.error("Error recovering login info:", error);
      setError("Check your index number or contact support");
    } finally {
      setIsLoading(false);
    }
  }, [indexNumber, onLoad]);

  const handleSend = useCallback(async () => {
    setError("");
    setSuccessMessage("");
    setIsSending(true);
    try {
      console.log(
        "Attempting to send login info for index number:",
        indexNumber
      );
      await onSend(indexNumber);
      console.log("Send operation completed");
      setSuccessMessage(
        "Login information sent successfully. Please check your phone for the new PIN."
      );
    } catch (error) {
      console.error("Error sending login info:", error);
      setError("An error occurred while sending user information.");
    } finally {
      setIsSending(false);
    }
  }, [indexNumber, onSend]);

  return (
    <div
      className="recover-popup"
      style={{ display: "flex" }}
      onClick={onClose}
    >
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <h2 className="popup-title">Recover Lost Login</h2>
        <div className="recover-content">
          <input
            type="text"
            value={indexNumber}
            onChange={handleIndexInput}
            placeholder="Enter Index Number"
            maxLength={12}
          />
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
          {recoveredCredentials && (
            <div>
              <p>Serial Number: {recoveredCredentials.serialNumber}</p>
              <p>PIN: {recoveredCredentials.pin}</p>
            </div>
          )}
          <div className="button-group">
            <button onClick={handleLoad} disabled={isLoading || isSending}>
              {isLoading ? "Loading..." : "Load"}
            </button>
            <button onClick={handleSend} disabled={isLoading || isSending}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
        <p className="note">
          Note: Login recovery is only available for successfully paid
          applicants. A new PIN will be generated and sent to your registered
          phone number.
        </p>
      </div>
    </div>
  );
}
