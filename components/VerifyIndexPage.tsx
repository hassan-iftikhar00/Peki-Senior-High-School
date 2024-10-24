"use client";

import { useState } from "react";
import Image from "next/image";

export default function VerifyIndexPage({
  onVerify,
}: {
  onVerify: (indexNumber: string) => void;
}) {
  const [indexNumber, setIndexNumber] = useState("");

  return (
    <div className="card">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg"
        alt="Peki Senior High School Logo"
        width={80}
        height={80}
        className="logo"
      />
      <h1>Peki Senior High School</h1>
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
        E.g. xxxxxxxxxxx24
      </div>
      <button onClick={() => onVerify(indexNumber)}>Verify Now</button>
      <footer>Packets Out LLC (Smart Systems)</footer>
    </div>
  );
}
