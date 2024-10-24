"use client";

import { useState } from "react";

export default function ApplicantPopup({
  onClose,
  onBuyVoucher,
}: {
  onClose: () => void;
  onBuyVoucher: (phoneNumber: string) => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 0 && value[0] !== "0") {
      value = "0" + value.slice(1);
    }
    value = value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(value);
  };

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
              <strong>Name: TAMAKLOE GERTRUDE EDINAM</strong>
            </p>
            <p>Index Number: 011300119323</p>
            <p>Programme: GENERAL ARTS</p>
            <p>Gender: Female</p>
            <p>Residence: Boarding</p>
            <p>Aggregate: 31</p>
          </div>
          <div className="warning-box">
            <p className="warning-text">
              Enter only an active phone number below. You will receive login
              credentials (Serial and PIN) and other information on this number
            </p>
          </div>
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
            disabled={!isPhoneValid}
            onClick={() => isPhoneValid && onBuyVoucher(phoneNumber)}
          >
            Buy application voucher
          </button>
        </div>
        <div className="popup-footer">
          <p className="footer-text">Packets Out LLC (Smart Systems)</p>
        </div>
      </div>
    </div>
  );
}
