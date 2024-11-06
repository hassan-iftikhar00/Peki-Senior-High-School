"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful, redirecting to admin dashboard");
        router.push("/admin");
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          width: "300px",
          padding: "20px",
          textAlign: "center",
          minHeight: "450px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        className="card"
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
            Admin Login
          </h2>
        </div>
        {error && (
          <div
            style={{
              color: "red",
              fontSize: "14px",
              marginBottom: "16px",
            }}
            className="error"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
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
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
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
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "-6%",
                background: "none",
                border: "none",
                cursor: "pointer",
                margin: 0,
                width: "141px",
              }}
            >
              {showPassword ? (
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
