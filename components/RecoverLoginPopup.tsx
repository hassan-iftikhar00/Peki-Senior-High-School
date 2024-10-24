"use client";

import { useState } from "react";

export default function RecoverLoginPopup({
  onClose,
  onLoad,
  onSend,
}: {
  onClose: () => void;
  onLoad: (indexNumber: string) => void;
  onSend: (indexNumber: string) => void;
}) {
  const [indexNumber, setIndexNumber] = useState("");

  const handleIndexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndexNumber(e.target.value.replace(/\D/g, "").slice(0, 12));
  };

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
          <div className="button-group">
            <button onClick={() => onLoad(indexNumber)}>Load</button>
            <button onClick={() => onSend(indexNumber)}>Send</button>
          </div>
        </div>
        <p className="note">
          Note: Login recovery is only available for successfully paid
          applicants.
        </p>
      </div>
    </div>
  );
}
