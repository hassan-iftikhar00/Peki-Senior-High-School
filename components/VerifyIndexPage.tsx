"use client";

import { useState } from "react";
import Image from "next/image";
import { useSchoolSettings } from "@/app/contexts/SchoolSettingsContext";

export default function VerifyIndexPage({
  onVerify,
}: {
  onVerify: (indexNumber: string) => void;
}) {
  const [indexNumber, setIndexNumber] = useState("");
  const { settings } = useSchoolSettings();

  return (
    <div className="card">
      <Image
        src={settings.logo}
        alt={`${settings.name} Logo`}
        width={80}
        height={80}
        className="logo"
      />
      <h1>{settings.name}</h1>
      <h2>Verify Index Number</h2>
      <input
        type="text"
        value={indexNumber}
        onChange={(e) =>
          setIndexNumber(e.target.value.replace(/\D/g, "").slice(0, 12))
        }
        placeholder="Enter index number"
        maxLength={12}
      />
      <div className="hint">
        <span className="red-text">Add the year you completed JHS</span>
        <br />
        E.g. {settings.indexNumberHint}
      </div>
      <button onClick={() => onVerify(indexNumber)}>Verify Now</button>
      <footer>Packets Out LLC (Smart Systems)</footer>
    </div>
  );
}
