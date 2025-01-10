"use client";

import React, { useState, useEffect } from "react";
import { useSchoolSettings } from "@/app/contexts/SchoolSettingsContext";

export default function Actions() {
  const { settings, updateSettings } = useSchoolSettings();
  const [voucherPrice, setVoucherPrice] = useState(settings.voucherPrice || 80);
  const [voucherMessage, setVoucherMessage] = useState(
    settings.voucherMessage ||
      "Thank you for purchasing an admission voucher.\nYour application process can now begin."
  );
  const [bulkMessage, setBulkMessage] = useState(
    "Apply now for admission to our school! Visit our\nwebsite for more information."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaveVoucherPrice = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateSettings({ voucherPrice });
      setSuccessMessage("Voucher price updated successfully!");
    } catch (err) {
      setError("Failed to update voucher price. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVoucherMessage = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateSettings({ voucherMessage });
      setSuccessMessage("Voucher message updated successfully!");
    } catch (err) {
      setError("Failed to update voucher message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBulkMessage = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Fetch eligible candidates
      const candidatesResponse = await fetch(
        "/api/admin/get-eligible-candidates"
      );
      if (!candidatesResponse.ok) {
        throw new Error("Failed to fetch eligible candidates");
      }
      const candidatesData = await candidatesResponse.json();

      if (!candidatesData.success || !candidatesData.candidates.length) {
        setSuccessMessage("No eligible candidates found to send messages.");
        return;
      }

      // Send messages to eligible candidates
      const results = await Promise.all(
        candidatesData.candidates.map(
          async (candidate: { phoneNumber: any }) => {
            const smsResponse = await fetch("/api/send-sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: candidate.phoneNumber,
                content: bulkMessage,
              }),
            });
            return smsResponse.json();
          }
        )
      );

      const successCount = results.filter((result) => result.success).length;
      const failCount = results.length - successCount;

      setSuccessMessage(
        `Bulk message sent successfully to ${successCount} candidates. ${
          failCount > 0 ? `Failed to send to ${failCount} candidates.` : ""
        }`
      );
    } catch (err) {
      setError("Failed to fetch eligible candidates. Please try again.");
      console.error("Bulk message preparation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setVoucherPrice(settings.voucherPrice || 80);
    setVoucherMessage(
      settings.voucherMessage ||
        "Thank you for purchasing an admission voucher.\nYour application process can now begin."
    );
  }, [settings]);

  return (
    <div className="inner-content">
      <div className="actions-page">
        <div className="actions-header">
          <h2>Actions</h2>
          <p className="subtitle">
            Manage admission voucher and messages here.
          </p>
        </div>

        {error && <div className="actionspage-error-message">{error}</div>}
        {successMessage && (
          <div className="actionspage-success-message">{successMessage}</div>
        )}

        <div className="actions-card">
          <form className="actions-form">
            <div className="action-group">
              <label htmlFor="voucherPrice">
                <span className="label-text">Admission Voucher Price</span>{" "}
              </label>
              <div className="input-with-button">
                <input
                  type="number"
                  id="voucherPrice"
                  value={voucherPrice}
                  onChange={(e) => setVoucherPrice(Number(e.target.value))}
                  className="price-input"
                />
                <button
                  type="button"
                  className="action-button not-admin"
                  onClick={handleSaveVoucherPrice}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="action-group">
              <label htmlFor="voucherMessage">
                <span className="label-text">
                  Message After Voucher Purchase
                </span>{" "}
              </label>
              <div className="input-with-button">
                <textarea
                  id="voucherMessage"
                  value={voucherMessage}
                  onChange={(e) => setVoucherMessage(e.target.value)}
                  className="message-input"
                  rows={4}
                ></textarea>
                <button
                  type="button"
                  className="action-button not-admin"
                  onClick={handleSaveVoucherMessage}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="action-group">
              <label htmlFor="bulkMessage">
                <span className="label-text">Bulk Message to Applicants</span>{" "}
              </label>
              <div className="input-with-button">
                <textarea
                  id="bulkMessage"
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  className="message-input"
                  rows={4}
                ></textarea>
                <button
                  type="button"
                  className="action-button not-admin"
                  onClick={handleSendBulkMessage}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
