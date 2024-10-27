import Image from "next/image";
import { useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplicantLoginPageProps {
  onRecoverLink: () => void;
  onLogin: (indexNumber: string, serial: string, pin: string) => Promise<void>;
}

export default function ApplicantLoginPage({
  onRecoverLink,
  onLogin,
}: ApplicantLoginPageProps) {
  const [indexNumber, setIndexNumber] = useState("");
  const [serial, setSerial] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      await onLogin(indexNumber, serial, pin);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#f0f0f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: 0,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "260px",
          padding: "20px",
          textAlign: "center",
          minHeight: "450px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg"
            alt="Peki Senior High School Logo"
            width={80}
            height={80}
            style={{
              width: "80px",
              height: "80px",
              marginBottom: "16px",
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
            }}
          />
          <h1
            style={{
              color: "#008751",
              fontSize: "20px",
              fontWeight: 700,
              margin: "0 0 16px 0",
            }}
          >
            Peki Senior High School
          </h1>
          <h2
            style={{
              color: "#666",
              fontSize: "16px",
              fontWeight: 500,
              margin: "0 0 16px 0",
            }}
          >
            Application Login
          </h2>
        </div>
        {error && (
          <div
            style={{
              color: "#ff3b30",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={indexNumber}
            onChange={(e) => setIndexNumber(e.target.value)}
            placeholder="Enter index number"
            style={{
              width: "80%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "8px",
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
              backgroundColor: "#f0f0f0",
            }}
            required
          />
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Enter Serial"
            style={{
              width: "80%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "8px",
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
              backgroundColor: "#f0f0f0",
            }}
            required
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              style={{
                width: "80%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "8px",
                marginLeft: "auto",
                marginRight: "auto",
                display: "block",
                backgroundColor: "#f0f0f0",
              }}
              required
            />
            <button
              type="button"
              onClick={togglePinVisibility}
              style={{
                position: "absolute",
                right: "-23%",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {showPin ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </button>
          </div>
          <button
            type="submit"
            style={{
              width: "80%",
              backgroundColor: "#1a1a2e",
              color: "white",
              border: "none",
              borderRadius: "25px",
              padding: "12px 0",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
              opacity: isLoading ? 0.5 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div>
          <footer
            style={{
              color: "#666",
              fontSize: "12px",
              marginTop: "16px",
            }}
          >
            Packets Out LLC (Smart Systems)
          </footer>
        </div>
      </div>
    </div>
  );
}
