import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";

interface TopBarProps {
  applicantName: string;
  passportPhoto?: string;
}

export default function TopBar({ applicantName, passportPhoto }: TopBarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.setItem("isLoggedIn", "false");
      await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.setItem("isLoggedIn", "true"); // Revert on error
      // Optionally, notify the user of the error
    } finally {
      setIsLoggingOut(false);
    }
  };

  const avatarSrc =
    passportPhoto ||
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blank-CRJbfovrhtk24KR2rQYdS4Fjnr2BpU.jpg";

  return (
    <>
      <div
        className="top-bar"
        style={{
          position: "fixed",
          top: 0,
          display: "flex",
          justifyContent: "space-between",
          left: "280px",
          right: 0,
          zIndex: 1000,
          width: "calc(100vw - 280px)",
        }}
      >
        <div className="school-name">
          <div className="TopBarItems">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pesco-ypQANIO5MV7swwJQueIYrxVza3zlu1.jpg"
              alt="Peki Senior High School Logo"
              width={40}
              height={40}
              className="school-logo"
            />
          </div>
          <div className="TopBarItems">
            <span style={{ fontWeight: "bold" }}> Peki Senior High School</span>
          </div>
        </div>
        <div className="user-info">
          <div className="TopBarItems">
            <Image
              src={avatarSrc}
              alt="User Avatar"
              width={32}
              height={32}
              className="user-avatar"
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
          <div
            className="TopBarItems"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <span style={{ width: "100px" }}>{applicantName}</span>
            <button
              onClick={handleLogout}
              className="logout-button"
              aria-label="Logout"
              disabled={isLoggingOut}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "5px",
                borderRadius: "5px",
                transition: "background-color 0.3s",
                color: "black",
                opacity: isLoggingOut ? 0.5 : 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0e0e0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
      <LoadingOverlay message="Logging out..." isVisible={isLoggingOut} />
    </>
  );
}
